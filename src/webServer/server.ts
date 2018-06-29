import * as express from 'express';
import * as path from 'path';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as morgan from 'morgan';
import * as csv from 'csvtojson';
import * as open from 'opn';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternResult } from '../interfaces';
import LoggingService from '../services/LoggingService';
import ApplicationState from '../services/ApplicationState';
import config from '../config';
import EmitterConstants, { APPLICATION_STATE_UPDATE_TYPE } from '../constants/EmitterConstants';
import ActionTypes from '../constants/ActionTypes';

class Server {
    private readonly _app;
    private readonly _server;
    private _io;
    private _connectedSockets: object = {};

    constructor() {
        this._app = express();
        this._server = http.createServer(this._app);
        this._io = socketIO(this._server);
        this.handlePatternResultMeasurement = this.handlePatternResultMeasurement.bind(this);
        this.handleApplicationStateUpdate = this.handleApplicationStateUpdate.bind(this);
    }

    public start() {
        this.setUpMiddleware();
        this.setUpRoutes();
        this.setUpListeners();
        return new Promise((resolve, reject) => {
            this._server.setTimeout(1000);
            this._server.listen(config.webServer.port, err => {
                if (err) {
                    LoggingService.logEvent('Error starting server.');
                    return reject(err);
                }
                open(`http://localhost:${config.webServer.port}`, { app: ['Google Chrome', '--incognito'] },);
                resolve(config.webServer.port);
            });
        });
    }

    private setUpListeners() {
        ExperimentRunner.on(EmitterConstants.PATTERN_MEASUREMENT, this.handlePatternResultMeasurement);
        ApplicationState.on(EmitterConstants.APPLICATION_STATE_UPDATE, this.handleApplicationStateUpdate);
        this._io.on('connection', socket => {
            this._connectedSockets[socket.id] = socket;
            socket.emit('update', { type: ActionTypes.EXPERIMENT_PHASE, data: ApplicationState.phase });
            socket.emit('update', { type: ActionTypes.PATTERNS, data: ApplicationState.patterns });
        });
    }

    private setUpMiddleware() {
        this._app.use(express.static(__dirname + '/public'));
        this._app.use(morgan('tiny'));
    }

    private setUpRoutes() {
        this._app.post('/api/v1/end/:result', (req, res) => {
            if (!['succeed', 'fail'].includes(req.params.result)) {
                res.status(400).json({
                    message: 'Query param must either be "succeed" or "fail"'
                });
            }
            res.sendStatus(200);
            this.shutdown(req.params.result);
        });

        // Provide download link to measurements and system event logs
        this._app.get('/api/v1/logs', (req, res) => {
            const validTypes = ['measurements', 'systemEvents'];
            if (!validTypes.includes(req.query.type)) {
                res.sendStatus(404);
                return;
            }
            res.download(config.logging.loggers[req.query.type].filename);
        });

        this._app.get('/api/v1/logs/workloads', (req, res) => {
            const validWorkloads = ApplicationState.patterns.map(p => p.name);
            if (!validWorkloads.includes(req.query.pattern)) {
                res.sendStatus(404);
                return;
            }
            res.download(path.join(config.logging.loggers.workloads.filename(req.query.pattern)));
        });

        this._app.get('/api/v1/measurements', (req, res) => {
            const measurements = [];
            csv()
                .fromFile(path.resolve(config.logging.loggers.measurements.filename))
                .on('json', json => {
                    measurements.push(json);
                })
                .on('error', () => {
                    res.sendStatus(500);
                })
                .on('done', () => {
                    res.json(measurements);
                })
        });

        this._app.get('*', (req, res) => {
            res.redirect('/');
        });
    }

    private shutdown(result) {
        this.destroySocketConnections();
        this._server.close(() => {
            switch (result) {
                case 'fail': {
                    ExperimentRunner.failExperiment();
                    process.exit(1);
                    break;
                }
                case 'succeed': {
                    ExperimentRunner.succeedExperiment();
                    process.exit(0);
                    break;
                }
            }
        });
    }

    private handlePatternResultMeasurement(patternResult: PatternResult) {
        this._io.emit('update', { type: ActionTypes.PATTERN_MEASUREMENT_UPDATE, data: patternResult });
    }

    private handleApplicationStateUpdate(updateType: string): void {
        switch (updateType) {
            case APPLICATION_STATE_UPDATE_TYPE.PHASE: {
                this._io.emit('update', { type: ActionTypes.EXPERIMENT_PHASE, data: ApplicationState.phase });
                break;
            }
            case APPLICATION_STATE_UPDATE_TYPE.PATTERNS: {
                this._io.emit('update', { type: ActionTypes.PATTERNS, data: ApplicationState.patterns });
                break;
            }
        }
    }

    private destroySocketConnections(): void {
        Object.keys(this._connectedSockets).forEach(socketId => {
            this._connectedSockets[socketId].disconnect(true);
        });
    }
}

export default new Server();

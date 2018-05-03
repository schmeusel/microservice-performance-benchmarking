import * as express from 'express';
import * as path from 'path';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as morgan from 'morgan';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternRequestMeasurement, PatternResult } from '../interfaces';
import LoggingService from '../services/LoggingService';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import ApplicationState from '../services/ApplicationState';
import config from '../config';

class Server {
    private _app;
    private _server;
    private _io;
    private _connectedSockets: object = {};
    private _measurementBatch: number = 100;
    private _cache: object = {
        measurements: []
    };

    constructor() {
        this._app = express();
        this._server = http.createServer(this._app);
        this._io = socketIO(this._server);
        this.handlePatternResultMeasurement = this.handlePatternResultMeasurement.bind(this);
        this.handleBenchmarkPhaseUpdate = this.handleBenchmarkPhaseUpdate.bind(this);
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
                resolve(config.webServer.port);
            });
        });
    }

    private setUpListeners() {
        ExperimentRunner.on('PATTERN_MEASUREMENT', this.handlePatternResultMeasurement);
        ApplicationState.on('PHASE_UPDATE', this.handleBenchmarkPhaseUpdate);
        this._io.on('connection', socket => {
            this._connectedSockets[socket.id] = socket;
            socket.emit('update', { type: 'EXPERIMENT_PHASE', data: ApplicationState.phase });
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

        // Provide download link to logs
        this._app.get('/api/v1/logs', (req, res) => {
            const validTypes = ['measurements', 'systemEvents'];
            if (!validTypes.includes(req.query.type)) {
                res.sendStatus(404);
                return;
            }
            res.download(path.join(config.logging.directory, `${req.query.type}.log`));
        });

        this._app.get('*', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });
    }

    private shutdown(result) {
        this.destroySocketConnections();
        this._server.close(() => {
            switch (result) {
                case 'fail': {
                    ExperimentRunner.failExperiment();
                    break;
                }
                case 'succeed': {
                    ExperimentRunner.succeedExperiment();
                    break;
                }
            }
        });
    }

    private handlePatternResultMeasurement(patternResult: PatternResult) {
        this._io.emit('update', { type: 'PATTERN_MEASUREMENT', data: patternResult });
    }

    private handleBenchmarkPhaseUpdate() {
        this._io.emit('update', { type: 'EXPERIMENT_PHASE', data: ApplicationState.phase });
    }

    private destroySocketConnections(): void {
        Object.keys(this._connectedSockets).forEach(socketId => {
            this._connectedSockets[socketId].disconnect(true);
        });
    }
}

export default new Server();

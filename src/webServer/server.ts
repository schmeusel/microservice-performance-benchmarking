import * as express from 'express';
import * as path from 'path';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as morgan from 'morgan';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternResultMeasurement } from '../interfaces';
import LoggingService from '../services/LoggingService';
import AbstractPatternResolver from '../pattern/AbstractPatternResolver';
import config from '../config';

class Server {
    private _app;
    private _server;
    private _io;
    private _measurementBatch: number = 100;
    private _cache: object = {
        measurements: []
    };

    constructor() {
        this._app = express();
        this._server = http.createServer(this._app);
        this._io = socketIO(this._server);
        this.handlePatternResultMeasurement = this.handlePatternResultMeasurement.bind(this);
        this.handleBenchmarkComplete = this.handleBenchmarkComplete.bind(this);
    }

    public start() {
        this.setUpMiddleware();
        this.setUpRoutes();
        this.setUpListeners();
        return new Promise((resolve, reject) => {
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
        ExperimentRunner.on('SOCKET_MEASUREMENT', this.handlePatternResultMeasurement);
        ExperimentRunner.on('BENCHMARK_COMPLETE', this.handleBenchmarkComplete);
        this._io.on('connection', socket => {
            console.log('connection established to socket');
        });
    }

    private setUpMiddleware() {
        this._app.use(express.static(__dirname + '/public'));
        this._app.use(morgan('tiny'));
    }

    private setUpRoutes() {
        this._app.get('/api/v1/status', (req, res) => {
            // total amount of requests for each pattern
            const stats = AbstractPatternResolver.patterns.reduce(
                (finalStats, pattern) => ({
                    ...finalStats,
                    [pattern.name]: {
                        total: pattern.amount,
                        round: 0
                    }
                }),
                {}
            );
            res.json({
                isRunning: ExperimentRunner.isRunning,
                stats: stats
            });
        });
        this._app.get('/api/v1/end/:result', (req, res) => {
            if (!['succeed', 'fail'].includes(req.params.result)) {
                res.status(400).json({
                    message: 'Query param must either be "succeed" or "fail"'
                });
            }
            res.json({
                message: 'it just works'
            });
            switch (req.params.result) {
                case 'fail': {
                    ExperimentRunner.failExperiment();
                    break;
                }
                case 'succeed': {
                    ExperimentRunner.succeedExperiment();
                    break;
                }
            }
            this._server.close();
        });

        this._app.get('*', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });
    }

    private handlePatternResultMeasurement(measurement: PatternResultMeasurement) {
        this._io.emit('update', { type: 'MEASUREMENTS_BATCH', data: measurement });
    }

    private handleBenchmarkComplete() {
        this._io.emit('update', { type: 'DECISION_TIME' });
    }
}

export default new Server();

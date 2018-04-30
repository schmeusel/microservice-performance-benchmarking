import * as express from 'express';
import * as path from 'path';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as morgan from 'morgan';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternResultMeasurement } from '../interfaces';
import LoggingService from '../services/LoggingService';

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
        ExperimentRunner.on('SOCKET_MEASUREMENT', this.handlePatternResultMeasurement);
        ExperimentRunner.on('BENCHMARK_COMPLETE', this.handleBenchmarkComplete);
        return new Promise((resolve, reject) => {
            this._app.listen(3000, err => {
                if (err) {
                    LoggingService.logEvent('Error starting server.');
                    return reject(err);
                }
                LoggingService.logEvent('Server started on port 3000...');
                resolve();
            });
        });
    }

    private setUpMiddleware() {
        this._app.use(express.static(__dirname + '/public'));
        this._app.use(morgan());
    }

    private setUpRoutes() {
        this._app.get('/', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });

        this._app.get('/status', (req, res) => {
            res.json({
                isRunning: ExperimentRunner.isRunning
            });
        });
        this._app.get('/end/:result', (req, res) => {
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
    }

    private handlePatternResultMeasurement(measurement: PatternResultMeasurement) {
        console.log('received measurement in server');
        this._io.emit('SOCKET_MEASUREMENT', measurement);
    }

    private handleBenchmarkComplete() {
        this._io.emit('DECISION_TIME');
    }
}

export default new Server();

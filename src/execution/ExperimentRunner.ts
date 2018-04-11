import { fork } from 'child_process';
import * as path from 'path';
import PatternRequester from './PatternRequester';
import LoggingService from '../services/LoggingService';
import { Pattern, PatternElementRequest, IPCMessage, IPCMessageType } from '../interfaces';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';

export default class ExperimentRunner {
    private patterns: Pattern[];
    private workersAlive: number;

    constructor(patterns: Pattern[]) {
        this.patterns = patterns;
        this.handleMessage = this.handleMessage.bind(this);
        this.handleWorkerDone = this.handleWorkerDone.bind(this);
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.patterns.forEach(pattern => {
                const worker = fork(path.resolve(__dirname, 'PatternRunner.js'), [
                    JSON.stringify(OpenAPIService.specification)
                ]);
                this.workersAlive += 1;
                worker.on('message', this.handleMessage);
                worker.on('exit', this.handleWorkerDone(resolve));
                worker.send({
                    type: IPCMessageType.INIT,
                    data: { pattern }
                } as IPCMessage);
            });
        });
    }

    private handleMessage(message: IPCMessage): void {
        switch (message.type) {
            case IPCMessageType.RESULT: {
                LoggingService.addMeasurements(message.data);
            }
        }
    }

    private handleWorkerDone(resolveCallback: () => void) {
        return () => {
            this.workersAlive -= 1;
            if (this.workersAlive === 0) {
                resolveCallback();
            }
        };
    }
}

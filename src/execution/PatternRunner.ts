import { IPCMessage, IPCMessageType, Pattern, PatternElementRequest, OpenAPISpecification } from '../interfaces/index';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';
import config from '../config';

let patternRequests: PatternElementRequest[] = [];

process.on('message', (message: IPCMessage) => {
    switch (message.type) {
        case IPCMessageType.START: {
            handleStart(message.data);
        }
    }
});

// TOOD type options more strongly
function handleStart({ openAPISpec, pattern, options }: { openAPISpec: OpenAPISpecification; pattern: Pattern; options: object }) {
    OpenAPIService.initialize(openAPISpec, options)
        .then(() => {
            readline
                .createInterface({
                    input: fs.createReadStream(config.logging.workloads.filename(pattern.name), 'utf8')
                })
                .on('line', line => {
                    handleLineRead(line, pattern);
                })
                .on('close', () => {});
        })
        .catch(err => {
            console.log('error during initializtion of openapis ervice');
        });
}

function handleLineRead(line: string, pattern: Pattern): Promise<void> {
    return new Promise((resolve, reject) => {
        if (line === config.logging.workloads.delimiter) {
            const requester: PatternRequester = new PatternRequester(pattern, patternRequests);
            requester
                .run()
                .then(measurements => {
                    handleRoundDone(measurements);
                    resolve();
                })
                .catch(err => {
                    // TODO error handling
                    console.log('error while executing pattern requests');
                    resolve();
                });
            patternRequests = [];
        } else {
            patternRequests.push();
            resolve();
        }
    });
}

function handleRoundDone(measurements) {
    process.send({
        type: IPCMessageType.RESULT,
        data: measurements
    });
}

function handleDone() {
    process.exit(0);
}

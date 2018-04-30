import { IPCMessage, IPCMessageType, Pattern, PatternElementRequest, OpenAPISpecification } from '../interfaces/index';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';
import config from '../config';
import PolyfillUtil from '../utils/PolyfillUtil';

let patternRequests: PatternElementRequest[] = [];
let rl: readline.ReadLine;

process.on('message', (message: IPCMessage) => {
    switch (message.type) {
        case IPCMessageType.START: {
            handleStart(message.data);
            break;
        }
        case IPCMessageType.ABORT: {
            handleAbort();
            break;
        }
    }
});

// TOOD type options more strongly
function handleStart({
    openAPISpec,
    pattern,
    options
}: {
    openAPISpec: OpenAPISpecification;
    pattern: Pattern;
    options: object;
}) {
    PolyfillUtil.initialize();
    OpenAPIService.initialize(openAPISpec, options)
        .then(() => {
            rl = readline
                .createInterface({
                    input: fs.createReadStream(config.logging.loggers.workloads.filename(pattern.name), 'utf8')
                })
                .on('line', handleLineRead(pattern))
                .on('close', handleDone)
                .on('error', error => {
                    // TODO proper error handling
                    console.log('error while reading pattern file', error);
                });
        })
        .catch(err => {
            console.log('error during initializtion of openapis ervice', err);
        });
}

function handleLineRead(pattern: Pattern) {
    let currentRound = 0;
    return line => {
        const request = JSON.parse(line) as PatternElementRequest;
        patternRequests.push(request);
        if (request.round !== currentRound) {
            const indexOfNextPatternElement = patternRequests.length - 2;
            rl.pause();

            const requests = patternRequests.slice(0, indexOfNextPatternElement);
            patternRequests = patternRequests.slice(indexOfNextPatternElement + 1);

            const requester: PatternRequester = new PatternRequester(pattern, requests);
            requester
                .run()
                .then(measurements => {
                    handleRoundDone(measurements);
                    currentRound = currentRound + 1;
                    rl.resume();
                })
                .catch(handleError);
        }
    };
}

function handleRoundDone(measurements) {
    process.send({
        type: IPCMessageType.RESULT,
        data: measurements
    });
}

function handleError(err) {
    process.send({
        type: IPCMessageType.ERROR,
        data: err
    });
}

function handleAbort() {
    process.exit(0);
}

function handleDone() {
    process.exit(0);
}

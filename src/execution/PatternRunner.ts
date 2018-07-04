import {
    IPCMessage,
    IPCMessageType,
    Pattern,
    PatternElementRequest,
    OpenAPISpecification,
    PatternResult
} from '../interfaces/index';
import * as fs from 'fs';
import * as readline from 'readline';
import PatternRequester from './PatternRequester';
import OpenAPIService from '../services/OpenAPIService';
import config from '../config';
import PolyfillUtil from '../utils/PolyfillUtil';

let patternRequests: PatternElementRequest[] = [];
let queue: PatternElementRequest[][] = [];
let currentRound: number = 0;
let isPerformingRequests: boolean = false;
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

function handleStart({ openAPISpec, pattern }: { openAPISpec: OpenAPISpecification; pattern: Pattern; }) {
    PolyfillUtil.initialize();
    OpenAPIService.initialize(openAPISpec)
        .then(() => {
            rl = readline
                .createInterface({
                    input: fs.createReadStream(config.logging.loggers.workloads.filename(pattern.name), 'utf8')
                })
                .on('line', handleLineRead(pattern))
                .on('error', handleError)
                .on('close', handleDone);
        })
        .catch(handleError);
}

function handleLineRead(pattern: Pattern) {
    return line => {
        const request = JSON.parse(line) as PatternElementRequest;
        patternRequests.push(request);

        if (request.patternIndex === pattern.sequence.length - 1) {
            rl.pause();
            const requests = patternRequests.slice(0, pattern.sequence.length);
            patternRequests = patternRequests.slice(pattern.sequence.length);
            if (!isPerformingRequests) {
                handleRequests(pattern, requests);
            } else {
                queue.push(requests);
            }
        }
    };
}

function handleRequests(pattern: Pattern, requests: PatternElementRequest[]) {
    isPerformingRequests = true;
    const requester: PatternRequester = new PatternRequester(pattern, requests);
    requester
        .run()
        .then(measurements => {
            handleMeasurements(pattern, measurements)
        })
        .catch((err) => {
            handleError(err);
        });
}

function handleMeasurements(pattern, measurements) {
    isPerformingRequests = false;
    handleRoundDone(measurements);
    currentRound = currentRound + 1;
    if (queue.length) {
        handleRequests(pattern, queue.shift());
    } else {
        rl.resume();
    }
}

function handleRoundDone(patternResult: PatternResult) {
    process.send({
        type: IPCMessageType.RESULT,
        data: patternResult
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

function log(message) {
    process.send({
        type: IPCMessageType.INFO,
        data: message
    });
}

import { IPCMessage, IPCMessageType, Pattern, PatternElementRequest, OpenAPISpecification } from '../interfaces/index';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';
import config from '../config';

let patternRequests: (PatternElementRequest | string)[] = [];
let rl: readline.ReadLine;

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
            rl = readline
                .createInterface({
                    input: fs.createReadStream(config.logging.workloads.filename(pattern.name), 'utf8')
                })
                .on('line', handleLineRead(pattern))
                .on('close', handleDone)
                .on('error', error => {
                    // TODO proper error handling
                    console.log('error while reading pattern file', error);
                });
        })
        .catch(err => {
            console.log('error during initializtion of openapis ervice');
        });
}

function handleLineRead(pattern: Pattern) {
    return line => {
        if (line === config.logging.workloads.delimiter) {
            patternRequests.push(line);
            const indexOfFirstDelimiter = patternRequests.findIndex(el => el === config.logging.workloads.delimiter);
            const requests = patternRequests.slice(0, indexOfFirstDelimiter) as PatternElementRequest[];

            if (indexOfFirstDelimiter > -1) {
                rl.pause();

                patternRequests = patternRequests.slice(indexOfFirstDelimiter + 1);

                const requester: PatternRequester = new PatternRequester(pattern, requests);
                requester
                    .run()
                    .then(measurements => {
                        handleRoundDone(measurements);
                        rl.resume();
                    })
                    .catch(err => {
                        // TODO error handling
                        console.log('error while executing pattern requests', err);
                    });
            }
        } else {
            patternRequests.push(JSON.parse(line));
        }
    };
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

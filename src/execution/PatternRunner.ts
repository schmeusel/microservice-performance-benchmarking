import { IPCMessage, IPCMessageType, Pattern } from '../interfaces/index';
import * as path from 'path';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';

let patternRequests;
let pattern;

process.on('message', (message: IPCMessage) => {
    switch (message.type) {
        case IPCMessageType.INIT: {
            handleInit(message.data.pattern);
        }
        case IPCMessageType.START: {
            handleStart();
        }
    }
});

function handlePatternReceival(pattern: Pattern) {
    PatternBuilder.generate(pattern).then(reqs => {
        patternRequests = reqs;
    });
}

function handleInit(mappedPattern: Pattern) {
    try {
        pattern = mappedPattern;
        const spec = JSON.parse(process.argv[2]);
        OpenAPIService.initialize(spec, {}).then(() => {
            handlePatternReceival(pattern);
        });
    } catch (e) {
        console.log('Could not parse SPEC in pattern runner');
    }
}

function handleStart() {
    const requester: PatternRequester = new PatternRequester(pattern.name, patternRequests);
    requester.run(handleRunDone);
}

function handleRunDone(measurements) {
    process.send({
        type: IPCMessageType.RESULT,
        data: measurements
    });
    process.exit(0);
}

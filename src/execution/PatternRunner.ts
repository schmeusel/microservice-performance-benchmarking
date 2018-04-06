import { IPCMessage, IPCMessageType, Pattern } from '../interfaces/index';
import * as path from 'path';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';
import OpenAPIService from '../services/OpenAPIService';

process.on('message', (message: IPCMessage) => {
    switch (message.type) {
        case IPCMessageType.INIT: {
            try {
                const spec = JSON.parse(process.argv[2]);
                OpenAPIService.initialize(spec, {}).then(() => {
                    handlePatternReceival(message.data.pattern);
                });
            } catch (e) {
                console.log('could not parse SPEC in pattern runner');
            }
        }
    }
});

function handlePatternReceival(pattern: Pattern) {
    PatternBuilder.generate(pattern).then(patternRequests => {
        const requester: PatternRequester = new PatternRequester(pattern.name, patternRequests);
        requester.run(handleRunDone);
    });
}

function handleRunDone(measurements) {
    process.send({
        type: IPCMessageType.RESULT,
        data: measurements
    });
    process.exit(0);
}

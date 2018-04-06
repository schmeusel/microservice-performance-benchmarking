import { IPCMessage, IPCMessageType, Pattern } from '../interfaces/index';
import PatternRequester from './PatternRequester';
import PatternBuilder from '../workload/PatternBuilder';

process.on('message', (message: IPCMessage) => {
    switch (message.type) {
        case IPCMessageType.INIT: {
            handlePatternReceival(message.data.pattern);
        }
    }
});

function handlePatternReceival(pattern: Pattern) {
    PatternBuilder.generate(pattern).then(patternRequests => {
        const requester: PatternRequester = new PatternRequester(pattern.name, patternRequests);
        requester.run(handleRunDone);
    });
}

function handleRunDone() {
    process.send({
        type: IPCMessageType.FINISHED
    });
}

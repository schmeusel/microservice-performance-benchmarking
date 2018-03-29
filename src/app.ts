// import LoggingManager from './logging/LoggingManager';

// LoggingManager.initialize();

// LoggingManager.log({ level: 'info', message: 'This is the first log' });
import winston, { format, createLogger, transports } from 'winston';
import { PatternRequestMeasurement, AbstractPatternElementOperation } from './interfaces';

const withMeasurement = (info, options) => {
    const { measurement } = <{ measurement: PatternRequestMeasurement }>info.measurement;
    if (measurement) {
        info.message = `${measurement.pattern},${measurement.operation},${measurement.timestampStart},${
            measurement.timestampEnd
        }`;
    }
    return info.message;
};

const logger = createLogger({
    transports: [
        new transports.Console({
            formatter: withMeasurement
        })
    ],
    colorize: true,
    json: false
});

// logger.configure({
//     transports: [
//         new logger.transports.Console({
//             colorize: true
//         })
//     ]
// });

const measurement = {
    pattern: 'test',
    operation: AbstractPatternElementOperation.CREATE,
    timestampStart: Date.now() - 60000,
    timestampEnd: Date.now()
} as PatternRequestMeasurement;

logger.log({
    level: 'info',
    measurement
});

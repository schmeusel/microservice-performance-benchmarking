import ActionTypes from '../constants/ActionTypes';
import { DefaultAsyncStub } from '../constants/CustomStubs';

const length = 50;
const mapToRandom = () => parseFloat(((Math.random() * 50) + 200).toFixed(2));
const patternNames = ['createResource', 'getItem', 'updateCreateRead', 'justDoIt'];
const buildRandomStepValues = () => ({
    operation: 'CREATE',
    latencies: {
        success: Array.from({ length })
            .map(mapToRandom),
        error: Array.from({ length })
            .map(mapToRandom),
    },
});
const measurements = patternNames.reduce((obj, name) => ({
    ...obj,
    [name]: {
        0: buildRandomStepValues(),
        1: buildRandomStepValues(),
        2: buildRandomStepValues(),
        3: buildRandomStepValues(),
        4: buildRandomStepValues(),
        5: buildRandomStepValues(),
    },
}), {});

/**
 * Format of the state goes:
 *
 * {
 *[patternName]: {
 *      [patternIndex]: {
 *          operation: READ | SCAN | CREATE | UPDATE | DELETE,
 *          latencies: {
 *              success: number[],
 *              error: number[]
 *          }
 *      }
 *  }
 * }
 *
 * Format of the action's data is the same as a PatternResult
 *
 * @param {*} state
 * @param {*} action
 */
export default function reducer(state = { values: measurements, async: DefaultAsyncStub }, action) {
    switch (action.type) {
        case ActionTypes.MEASUREMENTS.UPDATE: {
            const intermediate = {
                ...(state.values || {}),
                [action.data.name]: {
                    ...((state.values && state.values[action.data.name]) || {}),
                },
            };
            action.data.measurements.forEach((measurement) => {
                const latency = measurement.timestampEnd - measurement.timestampStart;
                if (!intermediate[action.data.name][measurement.patternIndex]) {
                    intermediate[action.data.name][measurement.patternIndex] = {
                        operation: measurement.operation,
                        latencies: {
                            error: [],
                            success: [],
                        },
                    };
                }
                if (measurement.status < 300) {
                    intermediate[action.data.name][measurement.patternIndex].latencies.success.push(latency);
                }
                if (measurement.status >= 400) {
                    intermediate[action.data.name][measurement.patternIndex].latencies.error.push(latency);
                }
            });

            return { ...state, values: intermediate };
        }
        case ActionTypes.MEASUREMENTS.FINAL_ASYNC: {
            return {
                ...state,
                async: action.data,
            };
        }
        case ActionTypes.MEASUREMENTS.FINAL: {
            const values = {};
            action.data.forEach((measurement) => {
                const latency = measurement.timestampEnd - measurement.timestampStart;
                if (!values[measurement.pattern] || !values[measurement.pattern][measurement.patternIndex]) {
                    if (!values[measurement.pattern]) {
                        values[measurement.pattern] = {};
                    }
                    values[measurement.pattern][measurement.patternIndex] = {
                        operation: measurement.operation,
                        latencies: {
                            error: [],
                            success: [],
                        },
                    };
                }
                if (measurement.status < 300) {
                    values[measurement.pattern][measurement.patternIndex].latencies.success.push(latency);
                }
                if (measurement.status >= 400) {
                    values[measurement.pattern][measurement.patternIndex].latencies.error.push(latency);
                }
            });

            return { ...state, values };
        }
    }
    return state;
}

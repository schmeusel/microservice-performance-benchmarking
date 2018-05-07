import ActionTypes from '../constants/ActionTypes';

/**
 * Format of the state goes:
 *
 * {
 *  [patternName]: {
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
export default function reducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.MEASUREMENTS: {
            const intermediate = {
                ...state,
                [action.data.name]: {
                    ...(state[action.data.name] || {})
                }
            };

            // TODO make more functional with reduce with starting accu "intermediate"
            action.data.measurements.forEach(measurement => {
                const latency = measurement.timestampEnd - measurement.timestampStart;
                if (!intermediate[action.data.name][measurement.patternIndex]) {
                    intermediate[action.data.name][measurement.patternIndex] = {
                        operation: measurement.operation,
                        latencies: {
                            error: [],
                            success: []
                        }
                    };
                }
                if (measurement.status < 300) {
                    intermediate[action.data.name][measurement.patternIndex].latencies.success.push(latency);
                }
                if (measurement.status >= 400) {
                    intermediate[action.data.name][measurement.patternIndex].latencies.error.push(latency);
                }
            });

            return intermediate;
        }
    }
    return state;
}

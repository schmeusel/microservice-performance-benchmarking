export const PHASES = {
    VALUES: {
        INITIALIZATON: 'INITIALIZATON',
        PATTERN_RESOLUTION: 'PATTERN_RESOLUTION',
        WORKLOAD_GENERATION: 'WORKLOAD_GENERATION',
        REQUEST_TRANSMISSION: 'REQUEST_TRANSMISSION',
        MEASUREMENT_EVALUATION: 'MEASUREMENT_EVALUATION',
        COMPLETION: 'COMPLETION'
    },
    get ABBREV() {
        return phase => {
            switch (phase) {
                case this.VALUES.INITIALIZATON:
                    return 'INIT';
                case this.VALUES.PATTERN_RESOLUTION:
                    return 'RES';
                case this.VALUES.WORKLOAD_GENERATION:
                    return 'WORK';
                case this.VALUES.REQUEST_TRANSMISSION:
                    return 'REQ';
                case this.VALUES.MEASUREMENT_EVALUATION:
                    return 'EVAL';
                case this.VALUES.COMPLETION:
                    return 'COMPL';
            }
        };
    },
    get ORDER() {
        return [
            this.VALUES.INITIALIZATON,
            this.VALUES.PATTERN_RESOLUTION,
            this.VALUES.WORKLOAD_GENERATION,
            this.VALUES.REQUEST_TRANSMISSION,
            this.VALUES.MEASUREMENT_EVALUATION,
            this.VALUES.COMPLETION
        ];
    }
};

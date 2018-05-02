import { EventEmitter } from 'events';

type ApplicationPhase = 'INITIALIZATON' | 'PATTERN_RESOLUTION' | 'WORKLOAD_GENERATION' | 'REQUEST_TRANSMISSION' | 'MEASUREMENT_EVALUATION' | 'COMPLETION';

class ApplicationState extends EventEmitter {
    private _phase: ApplicationPhase;

    constructor() {
        super();
        this._phase = 'INITIALIZATION' as ApplicationPhase;
    }

    public get phase() {
        return this._phase;
    }

    public set phase(newPhase: ApplicationPhase) {
        throw new Error('Use setter method to change phase.');
    }

    public setPhase(newPhase: ApplicationPhase) {
        this._phase = newPhase;
        this.emit('PHASE_UPDATE');
    }
}

export default new ApplicationState();

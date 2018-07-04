import { EventEmitter } from 'events';
import { OpenAPISpecification, AbstractPattern, Pattern, ApplicationPhase } from '../interfaces';
import EmitterConstants, { APPLICATION_STATE_UPDATE_TYPE } from '../constants/EmitterConstants';

class ApplicationState extends EventEmitter {
    private _phase: ApplicationPhase;
    private _openAPISpec: OpenAPISpecification;
    private _abstractPatterns: AbstractPattern[];
    private _patterns: Pattern[];
    private _successful: boolean;
    private _manualDecision: boolean;

    constructor() {
        super();
        this._phase = ApplicationPhase.INITIALIZATION;
        this._openAPISpec = null;
        this._abstractPatterns = null;
        this._patterns = null;
    }

    public get phase() {
        return this._phase;
    }

    public setPhase(newPhase: ApplicationPhase): void {
        this._phase = newPhase;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.PHASE);
    }

    public get openAPISpec(): OpenAPISpecification {
        return this._openAPISpec;
    }

    public setOpenAPISpecification(openAPISpec: OpenAPISpecification): void {
        this._openAPISpec = openAPISpec;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.OPEN_API_SPEC);
    }

    public get abstractPatterns(): AbstractPattern[] {
        return this._abstractPatterns;
    }

    public setAbstractPatterns(abstractPatterns: AbstractPattern[]): void {
        this._abstractPatterns = abstractPatterns;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.ABSTRACT_PATTERNS);
    }

    public get patterns(): Pattern[] {
        return this._patterns;
    }

    public setPatterns(patterns: Pattern[]): void {
        this._patterns = patterns;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.PATTERNS);
    }

    public get result(): string {
        return this._successful ? 'succeed' : 'fail';
    }

    public setResult(successful: boolean): void {
        this._successful = successful;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.DECISION_RESULT);
    }

    public get manualDecision(): boolean {
        return this._manualDecision;
    }

    public setManualDecision(manualDecision): void {
        this._manualDecision = manualDecision;
        this.emit(EmitterConstants.APPLICATION_STATE_UPDATE, APPLICATION_STATE_UPDATE_TYPE.MANUAL_DECISION);
    }
}

export default new ApplicationState();

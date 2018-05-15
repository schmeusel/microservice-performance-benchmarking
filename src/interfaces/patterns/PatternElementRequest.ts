export default interface PatternElementRequest {
    patternName: string;
    patternIndex: number;
    operationId: string;
    parameters?: object;
    requestBody?: object;
    wait: number;
    round: number;
}

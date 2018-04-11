export default interface AbstractPatternConfiguration {
    [patternName: string]: {
        [abstractPatternElementId: string]: string; // resource name for scans
    };
};

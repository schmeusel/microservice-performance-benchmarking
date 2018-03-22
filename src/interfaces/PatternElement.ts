export default interface PatternElement {
	operationId: string,
	wait?: number,
	// possible information about required parameters (e.g. key range)
	// dependency declaration between input <-> output of pattern element operations
}
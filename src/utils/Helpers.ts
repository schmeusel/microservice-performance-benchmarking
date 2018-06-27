/**
 * Iterator function to check whether a given key either matches given accessors or anything that resembles an ID.
 * @param {string[]} possibleSelectors
 * @returns {(key: string) => T | undefined | boolean}
 */
export function findIdKey(possibleSelectors: string[]) {
    const lowercaseSelectors = possibleSelectors
        ? possibleSelectors.map(str => str.toLowerCase())
        :[];

    return (key: string) => {
        const lowercaseKey = key.toLowerCase();
        return !!lowercaseSelectors.find(selector => selector === lowercaseKey) ||
            lowercaseKey === 'id' ||
            lowercaseKey.startsWith('id') ||
            lowercaseKey.endsWith('id');
    }
}

export function getExitCodeFromSuccess(wasSuccessful: boolean): number {
    return wasSuccessful
        ? 0
        : 1;
}

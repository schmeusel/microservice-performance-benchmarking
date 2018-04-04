declare global {
    interface String {
        endsWithInputParam(): boolean;
    }
}

class PolyfillUtil {
    public initialize(): Promise<void> {
        String.prototype.endsWithInputParam = function(this: string): boolean {
            return !!this.match(/\/\${.*}$/);
        };
        return Promise.resolve();
    }
}

export default new PolyfillUtil();

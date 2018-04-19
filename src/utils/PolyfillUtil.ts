declare global {
    interface String {
        endsWithInputParam(): boolean;
        getLastInputParam(): string;
    }
}

class PolyfillUtil {
    public initialize(): Promise<void> {
        String.prototype.endsWithInputParam = function(this: string): boolean {
            return !!this.match(/\/\${(.*)}$/);
        };

        String.prototype.getLastInputParam = function(this: string): string {
            const match = this.match(/\/\${(.[^\/]*)\}$/);
            return this.endsWithInputParam() && match ? match[1] : undefined;
        };

        return Promise.resolve();
    }
}

export default new PolyfillUtil();

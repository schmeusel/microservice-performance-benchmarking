declare global {
    interface String {
        endsWithInputParam(): boolean;
        getLastInputParam(): string;
        getAllInputParams(): string[];
    }
}

class PolyfillUtil {
    public initialize(): Promise<void> {
        String.prototype.endsWithInputParam = function(this: string): boolean {
            return !!this.match(/\/{(.+)}$/);
        };

        String.prototype.getLastInputParam = function(this: string): string {
            const match = this.match(/\/{(.[^\/]+)}$/);
            return this.endsWithInputParam() && match ? match[1] : undefined;
        };

        String.prototype.getAllInputParams = function(this: string): string[] {
            const regex = RegExp('/{(.[^/]+)}', 'g');
            const matches = [];
            let match;
            while ((match = regex.exec(this)) !== null) {
                matches.push(match[1]);
            }
            return matches;
        };

        return Promise.resolve();
    }
}

export default new PolyfillUtil();

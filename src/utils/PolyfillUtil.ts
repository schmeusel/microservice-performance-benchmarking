declare global {
    interface String {
        endsWithInputParam(): boolean;
    }
}

class PolyfillUtil {
    public initialize() {
        String.prototype.endsWithInputParam = function(this: string): boolean {
            return !!this.match(/\${.*}$/);
        };
    }
}

export default new PolyfillUtil();

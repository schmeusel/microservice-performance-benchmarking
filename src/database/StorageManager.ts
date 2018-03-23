import { PatternRequestMeasurement } from '../interfaces/index';
import { StorageError } from '../exceptions/index';

class StorageManager {
    private _client: any;
    private _batchSize: number;
    private _measurementCache: PatternRequestMeasurement[];

    public initialize(batchSize: number): Promise<void> {
        if (!batchSize) {
            throw new StorageError('StorageManager has to be initialized with a proper batch size.');
        }
        this._batchSize = batchSize;
        return this.connectDatabase();
    }

    public add(patternRequestMeasurement: PatternRequestMeasurement): void {
        this._measurementCache.push(patternRequestMeasurement);
        if (this._measurementCache.length === this._batchSize) {
            this.persistCache();
        }
    }

    private persistCache(): void {
        // write measurement queue in batch to DB or file
        throw new StorageError('persistCache not implemented yet.');
    }

    private connectDatabase(): Promise<void> {
        throw new StorageError('connectDatabase not implemented yet.');
    }
}

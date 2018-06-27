import { expect } from 'chai';
import { findIdKey } from '../../src/utils/Helpers';

describe('Test Helpers', () => {
    describe('findIdKey', () => {
        it('should correctly match an explicitly given accessors', () => {
            const keys = ['name', 'username', 'email', 'id'];
            const findForUsername = findIdKey(['username'])
            const result = keys.find(findForUsername);
            expect(result).to.equal('username');
        });

        it('should resort to something that resembles an ID key', () => {
            const keys = ['name', 'username', 'email', 'id'];
            const result = keys.find(findIdKey([]));
            expect(result).to.equal('id');
        });

        it('should resort to the property that ends with an ID name', () => {
            const keys = ['name', 'username', 'email', 'userId'];
            const result = keys.find(findIdKey([]));
            expect(result).to.equal('userId');
        });

        it('should not match anything if nothing matches the given keys and nothing resembles an ID', () => {
            const keys = ['name', 'username', 'email'];
            const result = keys.find(findIdKey([]));
            expect(result).to.equal(undefined);
        })
    });
});

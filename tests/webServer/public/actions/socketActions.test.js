import { handleSocket } from '../../../../src/webServer/public/actions/socketActions';

describe('Test socketActions', () => {
    describe('handleSocket(...)', () => {
        it('should take the type and data property from the argument', () => {
            const typeStub = 'a';
            const dataStub = 'b';
            const argument = {
                type: typeStub,
                data: dataStub,

            };
            const result = handleSocket(argument);
            expect(result)
                .toEqual({
                    type: typeStub,
                    data: dataStub,
                });
        });
    });
});

import { expect } from 'chai';
import { generatePopulatedSchema } from "../../src/utils/GeneratorUtil";

describe('Test GeneratorUtil', () => {
    describe('generatePopulatedSchema(...)', () => {
        const schemaStub = {
            "required": ["id", "name"],
            "properties": {
                "id": {
                    "type": "integer",
                    "format": "int64"
                },
                "name": {
                    "type": "string"
                },
                "tag": {
                    "type": "string"
                }
            }
        };

        it('should resolve without a value if no schema was provided', (done) => {
            generatePopulatedSchema(null, 'test')
                .then((value) => {
                    expect(value).to.be.null;
                    done();
                });
        });

        it('should resolve a given schema with populated data and do not use a param name if none was provided', (done) => {
            generatePopulatedSchema(schemaStub, null).then(populatedObject => {
                expect(populatedObject).to.be.an('object').that.has.all.keys('id', 'name');
                done();
            })
        });

        it('should resolve a given schema to an object that has the given paramName as a property and the resolved schema as the value', (done) => {
            const paramNameStub = 'test';
            generatePopulatedSchema(schemaStub, paramNameStub).then(populatedObject => {
                expect(populatedObject).to.be.an('object').that.has.all.keys(paramNameStub);
                expect(populatedObject[paramNameStub]).to.be.an('object').that.has.all.keys('id', 'name');
                done();
            })
        });
    });

});

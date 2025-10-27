/**
 * Unit tests for safe JSON parsing utilities.
 * Tests JSON parsing with protection against prototype pollution.
 */
import { expect } from '@esm-bundle/chai';
import { safeJsonParse } from './json';

describe('json utilities', () => {
    describe('safeJsonParse', () => {
        it('should parse valid JSON string', () => {
            const json = '{"key": "value"}';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal({ key: 'value' });
        });

        it('should parse JSON with nested objects', () => {
            const json = '{"outer": {"inner": "value"}}';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal({
                outer: {
                    inner: 'value'
                }
            });
        });

        it('should parse JSON arrays', () => {
            const json = '[1, 2, 3, 4, 5]';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal([ 1, 2, 3, 4, 5 ]);
        });

        it('should parse JSON with various data types', () => {
            const json = '{"string": "text", "number": 42, "boolean": true, "null": null}';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal({
                string: 'text',
                number: 42,
                boolean: true,
                null: null
            });
        });

        it('should parse empty object', () => {
            const json = '{}';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal({});
        });

        it('should parse empty array', () => {
            const json = '[]';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal([]);
        });

        it('should throw error for invalid JSON', () => {
            const invalidJson = '{invalid}';

            expect(() => safeJsonParse(invalidJson)).to.throw();
        });

        it('should protect against __proto__ pollution', () => {
            const maliciousJson = '{"__proto__": {"polluted": true}}';

            // @hapi/bourne should throw when it detects __proto__ pollution.
            expect(() => safeJsonParse(maliciousJson)).to.throw(SyntaxError, 'Object contains forbidden prototype property');
            expect(Object.prototype).to.not.have.property('polluted');
        });

        it('should protect against constructor pollution', () => {
            const maliciousJson = '{"constructor": {"prototype": {"polluted": true}}}';
            const result = safeJsonParse(maliciousJson);

            // @hapi/bourne should prevent prototype pollution.
            expect(Object.prototype).to.not.have.property('polluted');
            expect(result).to.be.an('object');
        });

        it('should parse JSON with special characters', () => {
            const json = '{"key": "value with \\"quotes\\" and \\nnewlines"}';
            const result = safeJsonParse(json);

            expect(result.key).to.include('quotes');
            expect(result.key).to.include('\n');
        });

        it('should parse JSON with unicode characters', () => {
            const json = '{"emoji": "😀", "chinese": "中文"}';
            const result = safeJsonParse(json);

            expect(result).to.deep.equal({
                emoji: '😀',
                chinese: '中文'
            });
        });

        it('should parse JSON with numbers in scientific notation', () => {
            const json = '{"small": 1e-10, "large": 1e10}';
            const result = safeJsonParse(json);

            expect(result.small).to.equal(1e-10);
            expect(result.large).to.equal(1e10);
        });

        it('should parse deeply nested JSON', () => {
            const json = '{"a": {"b": {"c": {"d": {"e": "deep"}}}}}';
            const result = safeJsonParse(json);

            expect(result.a.b.c.d.e).to.equal('deep');
        });
    });
});

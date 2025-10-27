/**
 * Unit tests for URI parsing and manipulation utilities.
 * Tests URI parsing, Jitsi Meet URL construction, and room name validation.
 */
import { expect } from '@esm-bundle/chai';
import {
    getLocationContextRoot,
    parseStandardURIString,
    parseURIString,
    toURLString,
    URI_PROTOCOL_PATTERN,
    urlObjectToString
} from './uri';

describe('uri utilities', () => {
    describe('URI_PROTOCOL_PATTERN', () => {
        it('should be a valid regex pattern string', () => {
            expect(URI_PROTOCOL_PATTERN).to.be.a('string');
            expect(URI_PROTOCOL_PATTERN).to.equal('^([a-z][a-z0-9\\.\\+-]*:)');
        });

        it('should match valid protocols', () => {
            const regex = new RegExp(URI_PROTOCOL_PATTERN, 'i');

            expect(regex.test('http:')).to.be.true;
            expect(regex.test('https:')).to.be.true;
            expect(regex.test('ftp:')).to.be.true;
            expect(regex.test('custom-scheme:')).to.be.true;
        });
    });

    describe('getLocationContextRoot', () => {
        it('should extract context root from pathname', () => {
            const result = getLocationContextRoot({ pathname: '/jitsi/room123' });

            expect(result).to.equal('/jitsi/');
        });

        it('should return "/" for pathname without directory', () => {
            const result = getLocationContextRoot({ pathname: 'room123' });

            expect(result).to.equal('/');
        });

        it('should handle pathname with trailing slash', () => {
            const result = getLocationContextRoot({ pathname: '/context/' });

            expect(result).to.equal('/context/');
        });

        it('should handle root pathname', () => {
            const result = getLocationContextRoot({ pathname: '/' });

            expect(result).to.equal('/');
        });

        it('should handle deeply nested pathnames', () => {
            const result = getLocationContextRoot({ pathname: '/a/b/c/room' });

            expect(result).to.equal('/a/b/c/');
        });
    });

    describe('parseStandardURIString', () => {
        it('should parse complete URI with all components', () => {
            const uri = 'https://meet.jitsi:8080/context/room?param=value#hash';
            const result = parseStandardURIString(uri);

            expect(result.protocol).to.equal('https:');
            expect(result.hostname).to.equal('meet.jitsi');
            expect(result.port).to.equal('8080');
            expect(result.pathname).to.equal('/context/room');
            expect(result.search).to.equal('?param=value');
            expect(result.hash).to.equal('#hash');
        });

        it('should parse URI without protocol', () => {
            const uri = '//meet.jitsi/room';
            const result = parseStandardURIString(uri);

            expect(result.protocol).to.be.undefined;
            expect(result.hostname).to.equal('meet.jitsi');
            expect(result.pathname).to.equal('/room');
        });

        it('should parse URI with only pathname', () => {
            const uri = '/context/room';
            const result = parseStandardURIString(uri);

            expect(result.protocol).to.be.undefined;
            expect(result.hostname).to.be.undefined;
            expect(result.pathname).to.equal('/context/room');
        });

        it('should parse URI without port', () => {
            const uri = 'https://meet.jitsi/room';
            const result = parseStandardURIString(uri);

            expect(result.hostname).to.equal('meet.jitsi');
            expect(result.port).to.be.undefined;
        });

        it('should add leading slash to pathname if missing', () => {
            const uri = 'https://meet.jitsi';
            const result = parseStandardURIString(uri);

            expect(result.pathname).to.equal('/');
        });

        it('should strip whitespace from URI', () => {
            const uri = 'https://meet.jitsi / room ';
            const result = parseStandardURIString(uri);

            expect(result.pathname).to.equal('/room');
        });

        it('should parse URI with query parameters', () => {
            const uri = 'https://meet.jitsi/room?param1=value1&param2=value2';
            const result = parseStandardURIString(uri);

            expect(result.search).to.equal('?param1=value1&param2=value2');
        });

        it('should parse URI with hash fragment', () => {
            const uri = 'https://meet.jitsi/room#section';
            const result = parseStandardURIString(uri);

            expect(result.hash).to.equal('#section');
        });

        it('should handle URI with userinfo in authority', () => {
            const uri = 'https://user:pass@meet.jitsi/room';
            const result = parseStandardURIString(uri);

            expect(result.hostname).to.equal('meet.jitsi');
            expect(result.host).to.equal('meet.jitsi');
        });

        it('should have toString method', () => {
            const uri = 'https://meet.jitsi:8080/room?param=value#hash';
            const result = parseStandardURIString(uri);

            expect(result.toString).to.be.a('function');
            expect(result.toString?.()).to.equal('https://meet.jitsi:8080/room?param=value#hash');
        });
    });

    describe('parseURIString', () => {
        it('should return undefined for non-string input', () => {
            expect(parseURIString(undefined)).to.be.undefined;
            expect(parseURIString(null as any)).to.be.undefined;
            expect(parseURIString(123 as any)).to.be.undefined;
        });

        it('should parse Jitsi Meet URI and extract room', () => {
            const uri = 'https://meet.jitsi/MyRoom123';
            const result = parseURIString(uri);

            expect(result?.room).to.equal('MyRoom123');
            expect(result?.contextRoot).to.equal('/');
        });

        it('should parse URI with context root and room', () => {
            const uri = 'https://meet.jitsi/jitsi/TestRoom';
            const result = parseURIString(uri);

            expect(result?.room).to.equal('TestRoom');
            expect(result?.contextRoot).to.equal('/jitsi/');
        });

        it('should remove invalid characters from room name', () => {
            const uri = 'https://meet.jitsi/Room:With<Invalid>Chars';
            const result = parseURIString(uri);

            // Invalid characters like :, <, > should be removed.
            expect(result?.room).to.not.include(':');
            expect(result?.room).to.not.include('<');
            expect(result?.room).to.not.include('>');
        });

        it('should handle URI without room', () => {
            const uri = 'https://meet.jitsi/';
            const result = parseURIString(uri);

            expect(result?.room).to.be.undefined;
            expect(result?.contextRoot).to.equal('/');
        });

        it('should fix app-specific URI schemes', () => {
            const uri = 'org.jitsi.meet://meet.jitsi/room';
            const result = parseURIString(uri);

            expect(result?.protocol).to.equal('https:');
            expect(result?.hostname).to.equal('meet.jitsi');
            expect(result?.room).to.equal('room');
        });

        it('should preserve all standard URI components', () => {
            const uri = 'https://meet.jitsi:8080/context/room?param=value#hash';
            const result = parseURIString(uri);

            expect(result?.protocol).to.equal('https:');
            expect(result?.hostname).to.equal('meet.jitsi');
            expect(result?.port).to.equal('8080');
            expect(result?.pathname).to.equal('/context/room');
            expect(result?.search).to.equal('?param=value');
            expect(result?.hash).to.equal('#hash');
            expect(result?.room).to.equal('room');
            expect(result?.contextRoot).to.equal('/context/');
        });
    });

    describe('toURLString', () => {
        it('should return string as-is', () => {
            const str = 'https://meet.jitsi/room';
            const result = toURLString(str);

            expect(result).to.equal(str);
        });

        it('should convert URL object to string', () => {
            const url = new URL('https://meet.jitsi/room');
            const result = toURLString(url);

            expect(result).to.equal('https://meet.jitsi/room');
        });

        it('should convert URL builder object to string', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom'
            };
            const result = toURLString(obj);

            expect(result).to.include('meet.jitsi');
            expect(result).to.include('TestRoom');
        });

        it('should return undefined for null/undefined', () => {
            expect(toURLString(undefined)).to.be.undefined;
            expect(toURLString(null as any)).to.be.undefined;
        });
    });

    describe('urlObjectToString', () => {
        it('should build URL from serverURL and room', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom'
            };
            const result = urlObjectToString(obj);

            expect(result).to.equal('https://meet.jitsi/TestRoom');
        });

        it('should use url property if provided', () => {
            const obj = {
                url: 'https://meet.jitsi/room'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('meet.jitsi/room');
        });

        it('should add protocol if missing', () => {
            const obj = {
                room: 'TestRoom',
                protocol: 'https'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('https:');
        });

        it('should append colon to protocol if missing', () => {
            const obj = {
                room: 'TestRoom',
                protocol: 'https'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('https:');
        });

        it('should add JWT to query string', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom',
                jwt: 'token123'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('jwt=token123');
        });

        it('should not duplicate JWT in query string', () => {
            const obj = {
                url: 'https://meet.jitsi/room?jwt=existing',
                jwt: 'token123'
            };
            const result = urlObjectToString(obj);

            // Should not add jwt again if already present.
            const jwtCount = (result.match(/jwt=/g) || []).length;

            expect(jwtCount).to.equal(1);
        });

        it('should add config overrides to hash', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom',
                config: {
                    startWithAudioMuted: true
                }
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('#config.');
            expect(result).to.include('startWithAudioMuted');
        });

        it('should support configOverwrite property', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom',
                configOverwrite: {
                    enableNoisyMicDetection: false
                }
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('#config.');
            expect(result).to.include('enableNoisyMicDetection');
        });

        it('should support interfaceConfig overrides', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom',
                interfaceConfig: {
                    SHOW_JITSI_WATERMARK: false
                }
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('interfaceConfig.');
        });

        it('should combine multiple config overrides', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                room: 'TestRoom',
                config: {
                    startWithAudioMuted: true
                },
                interfaceConfig: {
                    SHOW_JITSI_WATERMARK: false
                }
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('config.');
            expect(result).to.include('interfaceConfig.');
        });

        it('should handle roomName alias for room', () => {
            const obj = {
                serverURL: 'https://meet.jitsi',
                roomName: 'TestRoom'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('TestRoom');
        });

        it('should handle domain with appLinkScheme', () => {
            const obj = {
                domain: 'meet.jitsi/tenant',
                room: 'TestRoom',
                appLinkScheme: 'https:'
            };
            const result = urlObjectToString(obj);

            expect(result).to.include('meet.jitsi');
            expect(result).to.include('TestRoom');
        });

        it('should handle empty object', () => {
            const obj = {};
            const result = urlObjectToString(obj);

            expect(result).to.be.a('string');
        });

        it('should handle config params with circular reference (error path)', () => {
            // Create an object with circular reference to trigger JSON.stringify error in _objectToURLParamsArray
            const circular: any = { foo: 'bar' };
            circular.self = circular;

            const obj = {
                domain: 'meet.jitsi',
                room: 'test',
                config: { normalParam: 'value', circularParam: circular }
            };

            // Should still produce a URL despite the error (params with JSON.stringify error are skipped)
            const result = urlObjectToString(obj);
            expect(result).to.include('/test');
            expect(result).to.include('normalParam');
            // The circularParam is skipped due to JSON.stringify error
        });
    });

    describe('Branch coverage for pathname manipulation', () => {
        it('should handle pathname that already ends with slash', () => {
            // Test pathname ending slash logic
            const uri = 'https://meet.jitsi/room/';
            const result = parseStandardURIString(uri);

            expect(result.pathname).to.equal('/room/');
        });

        it('should handle URI with root pathname', () => {
            // Test various branch conditions in pathname handling
            const uri = 'https://meet.jitsi/';
            const result = parseStandardURIString(uri);

            // Pathname should be '/'
            expect(result.pathname).to.equal('/');
            expect(result.host).to.equal('meet.jitsi');
        });

        it('should handle search parameter with trailing question mark', () => {
            // Test search handling edge cases
            const uri = 'https://meet.jitsi/room?key=value';
            const result = parseStandardURIString(uri);

            expect(result.search).to.include('key=value');
        });

        it('should handle empty search after question mark', () => {
            // When URI has ? but no search params
            const uri = 'https://meet.jitsi/room#hash';
            const result = parseStandardURIString(uri);

            // Should have hash but no search
            expect(result.hash).to.equal('#hash');
        });

        it('should handle urlObjectToString when pathname is / and contextRoot is not', () => {
            // Test pathname === '/' && contextRoot !== '/' && (pathname = contextRoot)
            // Need: no url.host, domain with path, appLinkScheme, and room
            const obj = {
                domain: 'meet.jitsi/tenant',
                roomName: 'testroom',
                appLinkScheme: 'https'
            };
            const result = urlObjectToString(obj);

            // Should replace '/' pathname with contextRoot '/tenant/'
            expect(result).to.include('meet.jitsi/tenant/testroom');
        });

        it('should handle urlObjectToString when pathname does not end with slash', () => {
            // Test pathname?.endsWith('/') || (pathname += '/')
            // Need: domain with path (no trailing slash), appLinkScheme, and room
            const obj = {
                domain: 'meet.jitsi/context',
                roomName: 'testroom',
                appLinkScheme: 'https'
            };
            const result = urlObjectToString(obj);

            // Should add slash before room when pathname doesn't end with one
            expect(result).to.include('/context/testroom');
        });

        it('should handle urlObjectToString with jwt and empty search', () => {
            // Test jwt addition when search is empty
            const obj = {
                domain: 'meet.jitsi',
                room: 'testroom',
                jwt: 'abc123token'
            };
            const result = urlObjectToString(obj);

            // When search is just '?', should add jwt without '&'
            expect(result).to.include('jwt=abc123token');
        });

        it('should handle urlObjectToString with jwt and existing search params', () => {
            // Test jwt addition when search has existing params
            const obj = {
                url: 'https://meet.jitsi/room?param=value',
                jwt: 'abc123token'
            };
            const result = urlObjectToString(obj);

            // When search has existing params, should add & before jwt
            expect(result).to.include('param=value');
            expect(result).to.include('&jwt=abc123token');
        });

        it('should handle room name that needs fixing', () => {
            // Test when _fixRoom returns a different room name
            const uri = 'https://meet.jitsi/Room With Spaces';
            const result = parseURIString(uri);

            // Room should be fixed/normalized
            expect(result?.room).to.be.a('string');
        });

        it('should handle room name that becomes empty after fixing', () => {
            // Test the room || '' fallback when fixedRoom is empty
            // Use a room composed entirely of invalid characters
            const uri = 'https://meet.jitsi/context/:::<>?';
            const result = parseURIString(uri);

            // Room should be empty or undefined after removing all invalid chars
            // Pathname should still include the empty room
            expect(result?.pathname).to.equal('/context/');
            expect(result?.room).to.satisfy((r: string | undefined) => r === '' || r === undefined);
        });

        it('should handle _standardURIToString with undefined pathname', () => {
            // Test the pathname || '/' fallback in _standardURIToString
            const uri = parseStandardURIString('https://meet.jitsi');
            // Set pathname to undefined to test the fallback
            const modifiedUri = { ...uri, pathname: undefined as any };
            const result = modifiedUri.toString?.();

            // Should default to '/' when pathname is undefined
            expect(result).to.include('https://meet.jitsi/');
        });

        it('should handle urlObjectToString when url components are all empty', () => {
            // Test the toString?.() || '' fallback at line 541
            // The toString method exists but might return empty/falsy value
            // When no meaningful URL components exist
            const obj = {};

            const result = urlObjectToString(obj);

            // Should return empty string as fallback
            expect(result).to.be.a('string');
            // When there's no url, room, serverURL, etc., result should be minimal (just '/')
            expect(result.length).to.be.greaterThan(0);
        });

        it('should handle parseStandardURIString with pathname not starting with slash', () => {
            // Test pathname.startsWith('/') || (pathname = `/${pathname}`)
            // This tests the branch where pathname doesn't start with /
            const uri = 'room123';
            const result = parseStandardURIString(uri);

            // Should add leading slash
            expect(result.pathname).to.equal('/room123');
        });

        it('should handle parseStandardURIString with empty pathname match', () => {
            // Test the else branch when pathname is empty
            const uri = 'https://meet.jitsi';
            const result = parseStandardURIString(uri);

            // Should default to '/'
            expect(result.pathname).to.equal('/');
        });
    });
});

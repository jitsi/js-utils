import * as exported from './uri';

describe( 'uri tests', () => {
    it( 'should export function urlObjectToString', () => {
        expect( exported.urlObjectToString ).toBeDefined();
        expect( typeof exported.urlObjectToString ).toBe( 'function' );
    } );

    it( 'should generate url from uri properties', () => {
        expect( exported.urlObjectToString( {} ) ).toBe( '/' );
    } );

    // TODO: need some tests here based upon what it should be doing
} );
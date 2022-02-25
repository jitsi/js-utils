import * as exported from './randomUtil';

describe( 'randomNumberUtil tests', () => {
    it( 'generates a random string of length 3', () => {
        expect( exported.randomAlphanumString( 3 ).length ).toBe( 3 );
    } );

    it( 'generates a random string of length 7', () => {
        expect( exported.randomAlphanumString( 7 ).length ).toBe( 7 );
    } );

    it( 'picks a random element from a single element array', () => {
        const src = [ 'abc' ];
        expect( exported.randomElement( src ) ).toBe( src[ 0 ] );
    } );

    it( 'picks a random element from a multi element array', () => {
        const src = [ 'abc', 'def', 'ghi', 'jkl' ];
        const index = src.indexOf( exported.randomElement( src ) );
        expect( index ).toBeGreaterThanOrEqual( 0 );
        expect( index ).toBeLessThan( src.length );
    } );

    it( 'picks a random hex digit', () => {
        const index = '0123456789abcdef'.indexOf( exported.randomHexDigit() );
        expect( index ).toBeGreaterThanOrEqual( 0 );
        expect( index ).toBeLessThan( 16 );
    } );

    it( 'generates a random hex string of length 3', () => {
        expect( exported.randomHexString( 3 ).length ).toBe( 3 );
    } );

    it( 'generates a random hex string of length 7', () => {
        expect( exported.randomHexString( 7 ).length ).toBe( 7 );
    } );

    it( 'generates a random integer between 1 and 7', () => {
        const rnd = exported.randomInt( 1, 7 );
        expect( rnd ).toBeGreaterThanOrEqual( 1 );
        expect( rnd ).toBeLessThanOrEqual( 7 );
    } );

    // TODO: is it worth running the random tests with more iterations to try and make them fail?
} );

import * as exported from '../index';

describe( 'getGravatarURL tests', () => {
    it( 'passes non-email straight through', () => {
        expect( exported.getGravatarURL( 'test', 'https://test/' ) ).toBe( 'https://test/test?d=404&size=200' );
    } );

    it( 'hashes email address', () => {
        expect( exported.getGravatarURL( 'test@test.com', 'https://test/' ) ).toBe( 'https://test/b642b4217b34b1e8d3bd915fc65c4452?d=404&size=200' );
    } );
} );

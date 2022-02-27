import * as exported from './constants';

describe( 'transport constants tests', () => {
    it( 'exports MESSAGE_TYPE_EVENT', () => expect( exported.MESSAGE_TYPE_EVENT ).toBe( 'event' ) );
    it( 'exports MESSAGE_TYPE_REQUEST', () => expect( exported.MESSAGE_TYPE_REQUEST ).toBe( 'request' ) );
    it( 'exports MESSAGE_TYPE_RESPONSE', () => expect( exported.MESSAGE_TYPE_RESPONSE ).toBe( 'response' ) );
} );

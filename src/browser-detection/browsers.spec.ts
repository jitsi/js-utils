import * as exported from "./browsers";

describe( "browsers tests", () => {
  it( "exports CHROME", () => expect( exported.CHROME ).toBe( 'chrome' ) );
  it( "exports OPERA", () => expect( exported.OPERA ).toBe( 'opera' ) );
  it( "exports FIREFOX", () => expect( exported.FIREFOX ).toBe( 'firefox' ) );
  it( "exports INTERNET_EXPLORER", () => expect( exported.INTERNET_EXPLORER ).toBe( 'iexplorer' ) );
  it( "exports SAFARI", () => expect( exported.SAFARI ).toBe( 'safari' ) );
  it( "exports NWJS", () => expect( exported.NWJS ).toBe( 'nwjs' ) );
  it( "exports ELECTRON", () => expect( exported.ELECTRON ).toBe( 'electron' ) );
  it( "exports REACT_NATIVE", () => expect( exported.REACT_NATIVE ).toBe( 'react-native' ) );
  it( "exports UNKNOWN", () => expect( exported.UNKNOWN ).toBe( 'unknown' ) );
} );
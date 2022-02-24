import * as exported from "./browsers";

describe( "browsers tests", () => {
  expect( exported.CHROME ).toBe( 'chrome' );
  expect( exported.OPERA ).toBe( 'opera' );
  expect( exported.FIREFOX ).toBe( 'firefox' );
  expect( exported.INTERNET_EXPLORER ).toBe( 'iexplorer' );
  expect( exported.SAFARI ).toBe( 'safari' );
  expect( exported.NWJS ).toBe( 'nwjs' );
  expect( exported.ELECTRON ).toBe( 'electron' );
  expect( exported.REACT_NATIVE ).toBe( 'react-native' );
  expect( exported.UNKNOWN ).toBe( 'unknown' );
} );
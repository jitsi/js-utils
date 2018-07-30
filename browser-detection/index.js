export { default as BrowserDetection } from './BrowserDetection';


// XXX This is a workaround to not use 'export * as' which is not
// understandable to the Metro Bundler used in the React-Native.
import * as browsers from './browsers';
export { browsers };

/**
 * Unit tests for BrowserDetection class.
 * Tests browser and engine detection logic with various user agent strings.
 */
import { expect } from '@esm-bundle/chai';
import BrowserDetection from './BrowserDetection';
import { Browser, Engine } from './constants';

describe('BrowserDetection', () => {
    describe('Chrome detection', () => {
        it('should detect Chrome browser', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getName()).to.equal(Browser.CHROME);
            expect(detector.isChrome()).to.be.true;
            expect(detector.isChromiumBased()).to.be.true;
        });

        it('should extract Chrome version correctly', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.6099.109',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getVersion()).to.equal('120.0.6099.109');
        });

        it('should detect Chromium-based browsers via Blink engine', () => {
            const browserInfo = {
                name: 'Edge',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isChromiumBased()).to.be.true;
            expect(detector.getEngine()).to.equal(Engine.BLINK);
        });
    });

    describe('Firefox detection', () => {
        it('should detect Firefox browser', () => {
            const browserInfo = {
                name: 'Firefox',
                version: '121.0',
                engine: 'Gecko',
                engineVersion: '121.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getName()).to.equal(Browser.FIREFOX);
            expect(detector.isFirefox()).to.be.true;
            expect(detector.getEngine()).to.equal(Engine.GECKO);
        });

        it('should not detect Firefox as Chromium-based', () => {
            const browserInfo = {
                name: 'Firefox',
                version: '121.0',
                engine: 'Gecko',
                engineVersion: '121.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isChromiumBased()).to.be.false;
            expect(detector.isChrome()).to.be.false;
        });
    });

    describe('Safari detection', () => {
        it('should detect Safari browser', () => {
            const browserInfo = {
                name: 'Safari',
                version: '17.2',
                engine: 'WebKit',
                engineVersion: '605.1.15'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getName()).to.equal(Browser.SAFARI);
            expect(detector.isSafari()).to.be.true;
            expect(detector.isWebKitBased()).to.be.true;
        });

        it('should detect WebKit engine correctly', () => {
            const browserInfo = {
                name: 'Safari',
                version: '17.2',
                engine: 'WebKit',
                engineVersion: '605.1.15'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getEngine()).to.equal(Engine.WEBKIT);
            expect(detector.isWebKitBased()).to.be.true;
            expect(detector.isChromiumBased()).to.be.false;
        });
    });

    describe('Electron detection', () => {
        it('should detect Electron environment', () => {
            const browserInfo = {
                name: 'Electron',
                version: '28.0.0',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getName()).to.equal(Browser.ELECTRON);
            expect(detector.isElectron()).to.be.true;
        });
    });

    describe('Version comparison', () => {
        describe('isVersionGreaterThan', () => {
            it('should return true when browser version is greater', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionGreaterThan(119)).to.be.true;
                expect(detector.isVersionGreaterThan(100)).to.be.true;
            });

            it('should return false when browser version is not greater', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionGreaterThan(120)).to.be.false;
                expect(detector.isVersionGreaterThan(121)).to.be.false;
            });
        });

        describe('isVersionLessThan', () => {
            it('should return true when browser version is less', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionLessThan(121)).to.be.true;
                expect(detector.isVersionLessThan(130)).to.be.true;
            });

            it('should return false when browser version is not less', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionLessThan(120)).to.be.false;
                expect(detector.isVersionLessThan(119)).to.be.false;
            });
        });

        describe('isVersionEqualTo', () => {
            it('should return true when browser version is equal', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionEqualTo(120)).to.be.true;
            });

            it('should return false when browser version is not equal', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isVersionEqualTo(119)).to.be.false;
                expect(detector.isVersionEqualTo(121)).to.be.false;
            });
        });
    });

    describe('Engine version comparison', () => {
        describe('isEngineVersionGreaterThan', () => {
            it('should return true when engine version is greater', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionGreaterThan(119)).to.be.true;
            });

            it('should return false when engine version is not greater', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionGreaterThan(120)).to.be.false;
                expect(detector.isEngineVersionGreaterThan(121)).to.be.false;
            });
        });

        describe('isEngineVersionLessThan', () => {
            it('should return true when engine version is less', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionLessThan(121)).to.be.true;
            });

            it('should return false when engine version is not less', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionLessThan(120)).to.be.false;
            });
        });

        describe('isEngineVersionEqualTo', () => {
            it('should return true when engine version is equal', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionEqualTo(120)).to.be.true;
            });

            it('should return false when engine version is not equal', () => {
                const browserInfo = {
                    name: 'Chrome',
                    version: '120.0.0.0',
                    engine: 'Blink',
                    engineVersion: '120.0.0.0'
                };
                const detector = new BrowserDetection(browserInfo);

                expect(detector.isEngineVersionEqualTo(119)).to.be.false;
            });
        });
    });

    describe('Multiple browser checks', () => {
        it('should correctly identify which browser it is not', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isChrome()).to.be.true;
            expect(detector.isFirefox()).to.be.false;
            expect(detector.isSafari()).to.be.false;
            expect(detector.isElectron()).to.be.false;
            expect(detector.isReactNative()).to.be.false;
        });
    });

    describe('React Native detection', () => {
        it('should detect React Native from user agent with version', () => {
            // Save original user agent
            const originalUserAgent = navigator.userAgent;

            try {
                // Mock React Native user agent (lowercase to match Browser.REACT_NATIVE constant)
                Object.defineProperty(navigator, 'userAgent', {
                    value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) react-native/0.70.0',
                    configurable: true
                });

                const detector = new BrowserDetection();
                // When version is present in UA, name is extracted from the match
                expect(detector.getName()).to.equal('react-native');
                expect(detector.getVersion()).to.equal('0.70.0');
                expect(detector.isReactNative()).to.be.true;
            } finally {
                // Restore original values
                Object.defineProperty(navigator, 'userAgent', {
                    value: originalUserAgent,
                    configurable: true
                });
            }
        });

        it('should detect React Native from navigator.product', () => {
            // Save original values
            const originalUserAgent = navigator.userAgent;
            const originalProduct = navigator.product;

            try {
                // Mock navigator.product for React Native
                Object.defineProperty(navigator, 'product', {
                    value: 'ReactNative',
                    configurable: true
                });

                const detector = new BrowserDetection();
                expect(detector.getName()).to.equal(Browser.REACT_NATIVE);
                expect(detector.isReactNative()).to.be.true;
            } finally {
                // Restore original values
                Object.defineProperty(navigator, 'product', {
                    value: originalProduct,
                    configurable: true
                });
            }
        });
    });

    describe('Constructor without arguments (uses user agent)', () => {
        it('should detect browser from current user agent', () => {
            const detector = new BrowserDetection();

            // Just verify it creates a detector and can call methods
            expect(detector.getName()).to.be.a('string');
            expect(detector.getVersion()).to.be.a('string');
            expect(detector.getEngine()).to.be.a('string');
        });

        it('should use parser to get browser name when no cached name', () => {
            const detector = new BrowserDetection();

            // Call getName which should fallback to parser if no cached _name
            const name = detector.getName();
            expect(name).to.be.a('string');
            expect(name.length).to.be.greaterThan(0);
        });
    });

    describe('Additional OS and Engine methods', () => {
        it('should get engine version', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: '120.5.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.getEngineVersion()).to.equal('120.5.0.0');
        });

        it('should get OS name', () => {
            const detector = new BrowserDetection();

            expect(detector.getOS()).to.be.a('string');
        });

        it('should get OS version', () => {
            const detector = new BrowserDetection();
            const osVersion = detector.getOSVersion();

            // OS version can be undefined in headless CI environments (e.g., GitHub Actions)
            // but should be a string when available in regular browsers
            if (osVersion !== undefined) {
                expect(osVersion).to.be.a('string');
            }
        });

        it('should return false for isVersionLessThan when version is empty string', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isVersionLessThan(100)).to.be.false;
        });

        it('should return false for isVersionGreaterThan when version is empty string', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isVersionGreaterThan(100)).to.be.false;
        });

        it('should return false for isVersionEqualTo when version is empty string', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isVersionEqualTo(100)).to.be.false;
        });

        it('should fallback to parser getVersion when _version is empty', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '',
                engine: 'Blink',
                engineVersion: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            // Should fallback to parser which gets version from navigator.userAgent
            const version = detector.getVersion();
            expect(version).to.be.a('string');
        });

        it('should return false for engine version greater comparison when engineVersion is empty', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: ''
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isEngineVersionGreaterThan(100)).to.be.false;
        });

        it('should return false for engine version less comparison when engineVersion is empty', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: ''
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isEngineVersionLessThan(100)).to.be.false;
        });

        it('should return false for engine version equal comparison when engineVersion is empty', () => {
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0',
                engine: 'Blink',
                engineVersion: ''
            };
            const detector = new BrowserDetection(browserInfo);

            expect(detector.isEngineVersionEqualTo(100)).to.be.false;
        });

        it('should handle browser info without engine (undefined branch)', () => {
            // Test the ternary: engine ? ENGINES[engine] : undefined
            const browserInfo = {
                name: 'Chrome',
                version: '120.0.0.0'
            };
            const detector = new BrowserDetection(browserInfo);

            // When engine is not provided, getEngine should return undefined
            expect(detector.getEngine()).to.be.undefined;
        });
    });
});

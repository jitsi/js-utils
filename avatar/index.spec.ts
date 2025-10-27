/**
 * Unit tests for avatar/Gravatar utilities.
 * Tests Gravatar URL generation with various inputs.
 */
import { expect } from '@esm-bundle/chai';
import { getGravatarURL } from './index';

describe('avatar utilities', () => {
    describe('getGravatarURL', () => {
        it('should generate Gravatar URL for valid email', () => {
            const email = 'test@example.com';
            const url = getGravatarURL(email);

            expect(url).to.be.a('string');
            expect(url).to.include('https://www.gravatar.com/avatar/');
            expect(url).to.include('?d=404&size=200');
        });

        it('should hash email and generate URL', () => {
            const email = 'user@domain.com';
            const url = getGravatarURL(email);

            // MD5 hash of 'user@domain.com' is 'cd2bfcffe5fee4a1149d101994d0987f'.
            expect(url).to.equal('https://www.gravatar.com/avatar/cd2bfcffe5fee4a1149d101994d0987f?d=404&size=200');
        });

        it('should trim and lowercase email before hashing', () => {
            const email1 = '  Test@Example.COM  ';
            const email2 = 'test@example.com';

            const url1 = getGravatarURL(email1);
            const url2 = getGravatarURL(email2);

            // Should generate the same URL after trimming and lowercasing.
            expect(url1).to.equal(url2);
        });

        it('should handle pre-hashed key without hashing again', () => {
            const hashedKey = 'abc123def456';
            const url = getGravatarURL(hashedKey);

            // Should use the key as-is since it doesn't contain '@'.
            expect(url).to.equal('https://www.gravatar.com/avatar/abc123def456?d=404&size=200');
        });

        it('should use default base URL if not provided', () => {
            const email = 'test@example.com';
            const url = getGravatarURL(email);

            expect(url).to.include('https://www.gravatar.com/avatar/');
        });

        it('should use custom base URL if provided', () => {
            const email = 'test@example.com';
            const customBaseURL = 'https://custom.gravatar.com/';
            const url = getGravatarURL(email, customBaseURL);

            expect(url).to.include('https://custom.gravatar.com/');
            expect(url).to.include('?d=404&size=200');
        });

        it('should include default image and size parameters', () => {
            const email = 'test@example.com';
            const url = getGravatarURL(email);

            expect(url).to.include('d=404');
            expect(url).to.include('size=200');
        });

        it('should handle empty string as pre-hashed key', () => {
            const emptyKey = '';
            const url = getGravatarURL(emptyKey);

            // Empty string doesn't contain '@', so treated as pre-hashed key.
            expect(url).to.equal('https://www.gravatar.com/avatar/?d=404&size=200');
        });

        it('should handle email with multiple @ symbols', () => {
            const email = 'user@@domain.com';
            const url = getGravatarURL(email);

            // Contains '@' at position > 0, so treated as email and hashed.
            expect(url).to.be.a('string');
            expect(url).to.include('https://www.gravatar.com/avatar/');
        });

        it('should handle email with @ at the beginning', () => {
            const invalidEmail = '@domain.com';
            const url = getGravatarURL(invalidEmail);

            // '@' is at position 0, so not treated as valid email.
            expect(url).to.equal('https://www.gravatar.com/avatar/@domain.com?d=404&size=200');
        });

        it('should handle various valid email formats', () => {
            const emails = [
                'simple@example.com',
                'user.name@example.com',
                'user+tag@example.co.uk',
                'user_name@example-domain.com'
            ];

            emails.forEach(email => {
                const url = getGravatarURL(email);

                expect(url).to.be.a('string');
                expect(url).to.include('https://www.gravatar.com/avatar/');
                expect(url).to.match(/^https:\/\/www\.gravatar\.com\/avatar\/[a-f0-9]{32}\?d=404&size=200$/);
            });
        });

        it('should generate consistent URLs for same email', () => {
            const email = 'consistent@example.com';
            const url1 = getGravatarURL(email);
            const url2 = getGravatarURL(email);

            expect(url1).to.equal(url2);
        });

        it('should generate different URLs for different emails', () => {
            const email1 = 'user1@example.com';
            const email2 = 'user2@example.com';

            const url1 = getGravatarURL(email1);
            const url2 = getGravatarURL(email2);

            expect(url1).to.not.equal(url2);
        });

        it('should handle custom base URL without trailing slash', () => {
            const email = 'test@example.com';
            const customBaseURL = 'https://custom.gravatar.com/avatar';
            const url = getGravatarURL(email, customBaseURL);

            // Should concatenate directly (implementation doesn't add slash).
            expect(url).to.include('https://custom.gravatar.com/avatar');
        });
    });
});

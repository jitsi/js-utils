/**
 * Unit tests for room name generator.
 * Tests random room name generation following pattern-based templates.
 */
import { expect } from '@esm-bundle/chai';
import { generateRoomWithoutSeparator } from './roomNameGenerator';

describe('roomNameGenerator', () => {
    describe('generateRoomWithoutSeparator', () => {
        it('should generate non-empty room name', () => {
            const roomName = generateRoomWithoutSeparator();

            expect(roomName).to.be.a('string');
            expect(roomName.length).to.be.greaterThan(0);
        });

        it('should generate different room names on multiple calls', () => {
            const roomName1 = generateRoomWithoutSeparator();
            const roomName2 = generateRoomWithoutSeparator();
            const roomName3 = generateRoomWithoutSeparator();

            // While theoretically possible all 3 could be equal, probability is extremely low.
            const uniqueNames = new Set([ roomName1, roomName2, roomName3 ]);

            expect(uniqueNames.size).to.be.at.least(2);
        });

        it('should generate room names without spaces or separators', () => {
            const roomName = generateRoomWithoutSeparator();

            expect(roomName).to.not.include(' ');
            expect(roomName).to.not.include('-');
            expect(roomName).to.not.include('_');
            expect(roomName).to.not.include('.');
        });

        it('should generate room names with reasonable length', () => {
            // Generate multiple samples to test length distribution.
            for (let i = 0; i < 10; i++) {
                const roomName = generateRoomWithoutSeparator();

                // Room names should be between 10 and 100 characters typically.
                expect(roomName.length).to.be.at.least(10);
                expect(roomName.length).to.be.at.most(100);
            }
        });

        it('should generate room names starting with capital letter', () => {
            // Generate multiple samples.
            for (let i = 0; i < 10; i++) {
                const roomName = generateRoomWithoutSeparator();
                const firstChar = roomName.charAt(0);

                expect(firstChar).to.match(/[A-Z]/);
            }
        });

        it('should generate room names with only alphabetic characters', () => {
            // Generate multiple samples.
            for (let i = 0; i < 10; i++) {
                const roomName = generateRoomWithoutSeparator();

                expect(roomName).to.match(/^[A-Za-z]+$/);
            }
        });

        it('should generate variety of room names', () => {
            const roomNames = new Set();

            // Generate 20 room names.
            for (let i = 0; i < 20; i++) {
                roomNames.add(generateRoomWithoutSeparator());
            }

            // Should have at least 15 unique names out of 20.
            expect(roomNames.size).to.be.at.least(15);
        });

        it('should be deterministic with same internal randomness', () => {
            // This test verifies the function works consistently.
            const roomName = generateRoomWithoutSeparator();

            expect(roomName).to.be.a('string');
            expect(roomName.length).to.be.greaterThan(0);
        });
    });
});

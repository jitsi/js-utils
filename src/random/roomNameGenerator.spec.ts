import { generateRoomWithoutSeparator } from "./roomNameGenerator";

describe( "randomNameGenerator tests", () => {
    it( "generates a random name", () => {
        expect( generateRoomWithoutSeparator() ).toBeDefined();
    } );
} );
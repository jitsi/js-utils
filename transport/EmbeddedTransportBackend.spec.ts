import { expect } from '@esm-bundle/chai';
import EmbeddedTransportBackend, {
    createEmbeddedTransportPair
} from './EmbeddedTransportBackend';

describe('EmbeddedTransportBackend', () => {
    let backendA: EmbeddedTransportBackend;
    let backendB: EmbeddedTransportBackend;

    beforeEach(() => {
        [ backendA, backendB ] = createEmbeddedTransportPair();
    });

    afterEach(() => {
        backendA.dispose();
        backendB.dispose();
    });

    describe('createEmbeddedTransportPair', () => {
        it('should return two EmbeddedTransportBackend instances', () => {
            expect(backendA).to.be.instanceOf(EmbeddedTransportBackend);
            expect(backendB).to.be.instanceOf(EmbeddedTransportBackend);
        });

        it('should return two distinct instances', () => {
            expect(backendA).to.not.equal(backendB);
        });
    });

    describe('send', () => {
        it('should deliver message from A to B', () => {
            const received: any[] = [];

            backendB.setReceiveCallback(message => received.push(message));

            backendA.send({ type: 'event', data: 'hello' });

            expect(received).to.have.lengthOf(1);
            expect(received[0]).to.deep.equal({ type: 'event', data: 'hello' });
        });

        it('should deliver message from B to A', () => {
            const received: any[] = [];

            backendA.setReceiveCallback(message => received.push(message));

            backendB.send({ type: 'event', data: 'world' });

            expect(received).to.have.lengthOf(1);
            expect(received[0]).to.deep.equal({ type: 'event', data: 'world' });
        });

        it('should deliver multiple messages in order', () => {
            const received: any[] = [];

            backendB.setReceiveCallback(message => received.push(message));

            backendA.send({ id: 1 });
            backendA.send({ id: 2 });
            backendA.send({ id: 3 });

            expect(received).to.have.lengthOf(3);
            expect(received[0]).to.deep.equal({ id: 1 });
            expect(received[1]).to.deep.equal({ id: 2 });
            expect(received[2]).to.deep.equal({ id: 3 });
        });

        it('should not throw when no receive callback is set', () => {
            expect(() => backendA.send({ data: 'test' })).to.not.throw();
        });

        it('should support bidirectional communication', () => {
            const receivedByA: any[] = [];
            const receivedByB: any[] = [];

            backendA.setReceiveCallback(message => receivedByA.push(message));
            backendB.setReceiveCallback(message => receivedByB.push(message));

            backendA.send({ from: 'A' });
            backendB.send({ from: 'B' });

            expect(receivedByB).to.have.lengthOf(1);
            expect(receivedByB[0]).to.deep.equal({ from: 'A' });
            expect(receivedByA).to.have.lengthOf(1);
            expect(receivedByA[0]).to.deep.equal({ from: 'B' });
        });
    });

    describe('setReceiveCallback', () => {
        it('should replace the previous callback', () => {
            const first: any[] = [];
            const second: any[] = [];

            backendB.setReceiveCallback(message => first.push(message));
            backendA.send({ id: 1 });

            backendB.setReceiveCallback(message => second.push(message));
            backendA.send({ id: 2 });

            expect(first).to.have.lengthOf(1);
            expect(second).to.have.lengthOf(1);
        });
    });

    describe('dispose', () => {
        it('should stop delivering messages after dispose', () => {
            const received: any[] = [];

            backendB.setReceiveCallback(message => received.push(message));

            backendA.dispose();
            backendA.send({ data: 'after dispose' });

            expect(received).to.have.lengthOf(0);
        });

        it('should stop the other end from delivering messages', () => {
            const received: any[] = [];

            backendA.setReceiveCallback(message => received.push(message));

            backendB.dispose();
            backendB.send({ data: 'after dispose' });

            expect(received).to.have.lengthOf(0);
        });

        it('should be safe to call dispose twice', () => {
            expect(() => {
                backendA.dispose();
                backendA.dispose();
            }).to.not.throw();
        });

        it('should sever the connection in both directions', () => {
            const receivedByA: any[] = [];
            const receivedByB: any[] = [];

            backendA.setReceiveCallback(message => receivedByA.push(message));
            backendB.setReceiveCallback(message => receivedByB.push(message));

            backendA.dispose();

            backendA.send({ from: 'A' });
            backendB.send({ from: 'B' });

            expect(receivedByA).to.have.lengthOf(0);
            expect(receivedByB).to.have.lengthOf(0);
        });
    });

    describe('integration with Transport', () => {
        it('should work as a Transport backend', async () => {
            const { default: Transport } = await import('./Transport');

            const transportA = new Transport({ backend: backendA });
            const transportB = new Transport({ backend: backendB });

            const received: any[] = [];

            transportB.on('event', (data: any) => {
                received.push(data);

                return true;
            });

            transportA.sendEvent({ name: 'test-event', value: 42 });

            expect(received).to.have.lengthOf(1);
            expect(received[0]).to.deep.equal({ name: 'test-event', value: 42 });

            transportA.dispose();
            transportB.dispose();
        });

        it('should support request/response through Transport', async () => {
            const { default: Transport } = await import('./Transport');

            const transportA = new Transport({ backend: backendA });
            const transportB = new Transport({ backend: backendB });

            transportB.on('request', (data: any, callback: any) => {
                callback(data.x + data.y);

                return true;
            });

            const result = await transportA.sendRequest({ x: 3, y: 4 });

            expect(result).to.equal(7);

            transportA.dispose();
            transportB.dispose();
        });
    });
});

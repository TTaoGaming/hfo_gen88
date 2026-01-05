import { connect, StringCodec, type NatsConnection, type JetStreamClient } from 'nats';
import { GestureEnvelope } from './schemas.js';

const sc = StringCodec();

/**
 * 🥈 PORT 0: GESTURE NATS BRIDGE
 * 
 * Publishes GestureEnvelopes to NATS JetStream.
 * 
 * @provenance bronze/P0_GESTURE_KINETIC_DRAFT.md
 * @topic Gesture Control Plane
 */

export class GestureBridge {
  private nc: NatsConnection | null = null;
  private js: JetStreamClient | null = null;

  constructor(private servers: string = 'localhost:4222') {}

  async connect(): Promise<void> {
    try {
      this.nc = await connect({ servers: this.servers });
      this.js = this.nc.jetstream();
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  async publish(envelope: GestureEnvelope): Promise<void> {
    if (!this.js) {
      throw new Error('NATS JetStream not initialized. Call connect() first.');
    }

    const subject = `hfo.gen88.port0.gesture.raw`;
    const payload = JSON.stringify(envelope);

    try {
      await this.js.publish(subject, sc.encode(payload));
    } catch (error) {
      console.error(`Failed to publish to ${subject}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.nc) {
      await this.nc.drain();
      this.nc = null;
      this.js = null;
    }
  }
}

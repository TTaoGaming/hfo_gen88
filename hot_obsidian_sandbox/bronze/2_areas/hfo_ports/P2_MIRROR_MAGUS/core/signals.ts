/**
 * P2 MIRROR MAGUS - Silver Signals
 * 
 * @port 2
 * @commander MIRROR_MAGUS
 * @verb SHAPE
 * @tier SILVER
 * @promoted 2026-01-08
 */

export interface MirrorSignal {
  id: string;
  source: string;
  payload: any;
  ts: number;
}

/**
 * Transforms signals for consistent shaping.
 */
export function shapeSignal(signal: MirrorSignal): MirrorSignal {
  return {
    ...signal,
    ts: signal.ts || Date.now(),
    payload: typeof signal.payload === 'string' ? signal.payload.trim() : signal.payload
  };
}

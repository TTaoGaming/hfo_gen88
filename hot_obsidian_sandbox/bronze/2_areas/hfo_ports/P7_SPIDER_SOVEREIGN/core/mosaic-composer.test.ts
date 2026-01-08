import { describe, it, expect } from 'vitest';
import { MosaicComposer } from './mosaic-composer';

describe('P7-SUB-5: Mosaic Composer', () => {
  it('should register tiles and compose missions', () => {
    const mosaic = new MosaicComposer();
    mosaic.registerTile({ id: 't1', capability: 'SENSE', reliability: 0.95 });
    mosaic.registerTile({ id: 't2', capability: 'ACT', reliability: 0.8 });
    
    const mission = mosaic.composeMission(['SENSE', 'ACT']);
    expect(mission.length).toBe(2);
    expect(mission[0].id).toBe('t1');
  });

  it('should select the most reliable tile', () => {
    const mosaic = new MosaicComposer();
    mosaic.registerTile({ id: 'bad', capability: 'SENSE', reliability: 0.1 });
    mosaic.registerTile({ id: 'good', capability: 'SENSE', reliability: 0.99 });
    
    const mission = mosaic.composeMission(['SENSE']);
    expect(mission[0].id).toBe('good');
  });
});

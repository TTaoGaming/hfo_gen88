import { describe, it, expect } from 'vitest';
import { TtvSensorFusion } from '../ttv-sensor-fusion';

describe('TTV Sensor Fusion', () => {
    it('should identify an object as an active tool when held by the hand', () => {
        const fusion = new TtvSensorFusion();
        
        // Mock landmarks: Hand index finger tip and Object center are near each other
        const handLandmarks = [{ x: 0.5, y: 0.5, z: 0 }];
        const objectLandmarks = [{ x: 0.51, y: 0.51, z: 0, label: 'marker' }];
        
        const activeTool = fusion.identifyActiveTool(handLandmarks, objectLandmarks);
        
        expect(activeTool).toBeDefined();
        expect(activeTool?.label).toBe('marker');
    });

    it('should return null when no object is near the hand', () => {
        const fusion = new TtvSensorFusion();
        
        const handLandmarks = [{ x: 0.1, y: 0.1, z: 0 }];
        const objectLandmarks = [{ x: 0.9, y: 0.9, z: 0, label: 'marker' }];
        
        const activeTool = fusion.identifyActiveTool(handLandmarks, objectLandmarks);
        
        expect(activeTool).toBeNull();
    });
});

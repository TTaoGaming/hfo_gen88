/**
 * TTV Sensor Fusion Logic
 * Combines Hand Landmarks and Object Landmarks to identify "Active Tools".
 */
export class TtvSensorFusion {
    private readonly THRESHOLD = 0.05; // 5% of screen width/height for proximity

    identifyActiveTool(handLandmarks: { x: number, y: number, z: number }[], objectLandmarks: { x: number, y: number, z: number, label: string }[]) {
        if (!handLandmarks.length || !objectLandmarks.length) return null;

        const hand = handLandmarks[0]; // Assuming index finger tip or hand center for now

        for (const object of objectLandmarks) {
            const distance = Math.sqrt(
                Math.pow(hand.x - object.x, 2) + 
                Math.pow(hand.y - object.y, 2)
            );

            if (distance < this.THRESHOLD) {
                return object;
            }
        }

        return null;
    }
}

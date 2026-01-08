/**
 * 🪞 P2-SUB-4: SHAPE CLASSIFIER
 * Classifies signal patterns into geometric primitives.
 */

export type ShapePrimitive = 'TAP' | 'SWIPE' | 'CIRCLE' | 'UNKNOWN';

export interface Point {
  x: number;
  y: number;
}

export class ShapeClassifier {
  /**
   * Identifies simple swipe vs tap based on distance and point count.
   */
  public classify(points: Point[]): ShapePrimitive {
    if (points.length < 2) return 'UNKNOWN';
    if (points.length < 5 && this.getDistance(points[0], points[points.length - 1]) < 10) {
      return 'TAP';
    }

    const dist = this.getDistance(points[0], points[points.length - 1]);
    const totalPath = this.getPathLength(points);

    // Swipe: Start/End distance is close to total path length (linear)
    if (dist > 50 && dist / totalPath > 0.8) {
      return 'SWIPE';
    }

    // Circle calculation omitted for simplicity in this sub-part incarnation
    return 'UNKNOWN';
  }

  private getDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private getPathLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += this.getDistance(points[i - 1], points[i]);
    }
    return length;
  }
}

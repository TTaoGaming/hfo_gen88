/**
 * 🪞 P2-SUB-3: ADAPTIVE THRESHOLD
 * Dynamically adjusts noise gating thresholds based on signal intensity.
 */

export class AdaptiveThreshold {
  private baseThreshold: number;
  private currentThreshold: number;
  private adaptationRate: number;

  constructor(baseThreshold: number = 5.0, adaptationRate: number = 0.1) {
    this.baseThreshold = baseThreshold;
    this.currentThreshold = baseThreshold;
    this.adaptationRate = adaptationRate;
  }

  /**
   * Evaluates if a value exceeds the current adaptive threshold.
   * Higher values slowly raise the threshold to prevent noise flutter.
   */
  public isSignificant(value: number): boolean {
    const significant = Math.abs(value) > this.currentThreshold;
    
    // Adapt threshold: move towards value, but don't drop below base
    if (significant) {
      this.currentThreshold += (Math.abs(value) - this.currentThreshold) * this.adaptationRate;
    } else {
      this.currentThreshold -= (this.currentThreshold - this.baseThreshold) * this.adaptationRate;
    }

    return significant;
  }

  public getThreshold(): number {
    return this.currentThreshold;
  }
}

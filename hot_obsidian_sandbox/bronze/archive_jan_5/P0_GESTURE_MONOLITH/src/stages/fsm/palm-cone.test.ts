/**
 * 🧪 PALM CONE TESTS
 * 
 * Property-based tests for palm cone validation.
 * 
 * Feature: gesture-pointer-monolith
 * Property 2: Palm cone filtering
 * Validates: Requirements 1.5, 3.3
 */

import { describe, it, expect } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { calculatePalmAngle, isInCone, validatePalmCone } from './palm-cone.js';
import type { Point3D } from '../../contracts/schemas.js';

/**
 * Generate a valid 21-landmark array with configurable palm orientation
 */
function generateLandmarks(palmZ: number = -0.1): Point3D[] {
  const landmarks: Point3D[] = [];
  
  // Generate 21 landmarks with reasonable positions
  for (let i = 0; i < 21; i++) {
    landmarks.push({
      x: 0.5 + (i % 5) * 0.02,
      y: 0.5 + Math.floor(i / 5) * 0.02,
      z: 0,
    });
  }
  
  // Wrist at base
  landmarks[0] = { x: 0.5, y: 0.6, z: 0 };
  // Middle MCP forward (palm facing camera when z is negative)
  // The vector from wrist to middle_mcp should point toward camera (-z)
  landmarks[9] = { x: 0.5, y: 0.5, z: palmZ };
  
  return landmarks;
}

describe('Palm Cone Validation', () => {
  describe('Unit Tests', () => {
    it('should calculate small angle for palm facing camera', () => {
      // Palm normal pointing toward camera (negative z)
      // Create landmarks where wrist-to-middleMcp vector has strong -z component
      const landmarks: Point3D[] = [];
      for (let i = 0; i < 21; i++) {
        landmarks.push({ x: 0.5, y: 0.5, z: 0 });
      }
      landmarks[0] = { x: 0.5, y: 0.5, z: 0 }; // Wrist
      landmarks[9] = { x: 0.5, y: 0.5, z: -0.2 }; // Middle MCP (forward toward camera)
      
      const angle = calculatePalmAngle(landmarks);
      expect(angle).toBeLessThan(10); // Should be close to 0
    });

    it('should calculate ~90° for palm perpendicular to camera', () => {
      // Palm normal perpendicular (z = 0, only x/y difference)
      const landmarks: Point3D[] = [];
      for (let i = 0; i < 21; i++) {
        landmarks.push({ x: 0.5, y: 0.5, z: 0 });
      }
      landmarks[0] = { x: 0.5, y: 0.6, z: 0 }; // Wrist
      landmarks[9] = { x: 0.6, y: 0.5, z: 0 }; // Middle MCP (to the side)
      
      const angle = calculatePalmAngle(landmarks);
      expect(angle).toBeGreaterThan(80);
      expect(angle).toBeLessThanOrEqual(90);
    });

    it('should return true for angle within cone', () => {
      expect(isInCone(30, 45)).toBe(true);
      expect(isInCone(45, 45)).toBe(true);
    });

    it('should return false for angle outside cone', () => {
      expect(isInCone(46, 45)).toBe(false);
      expect(isInCone(90, 45)).toBe(false);
    });

    it('should throw for invalid landmark count', () => {
      expect(() => calculatePalmAngle([])).toThrow('Expected 21 landmarks');
      expect(() => calculatePalmAngle([{ x: 0, y: 0, z: 0 }])).toThrow();
    });
  });

  describe('Property Tests', () => {
    /**
     * Property 2: Palm cone filtering
     * For any palm angle greater than the configured cone angle,
     * the gesture SHALL be treated as invalid (no state transition).
     * 
     * Feature: gesture-pointer-monolith, Property 2: Palm cone filtering
     * Validates: Requirements 1.5, 3.3
     */
    test.prop([
      fc.double({ min: 0, max: 90, noNaN: true }), // cone angle
      fc.double({ min: 0, max: 180, noNaN: true }), // palm angle
    ], { numRuns: 100 })(
      'isInCone correctly filters based on cone angle',
      (coneAngle, palmAngle) => {
        const result = isInCone(palmAngle, coneAngle);
        
        if (palmAngle <= coneAngle) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }
    );

    /**
     * Property: Palm angle is always non-negative and <= 180
     */
    test.prop([
      fc.double({ min: -1, max: 1, noNaN: true }),
      fc.double({ min: -1, max: 1, noNaN: true }),
      fc.double({ min: -1, max: 1, noNaN: true }),
    ], { numRuns: 100 })(
      'palm angle is always in valid range [0, 180]',
      (dx, dy, dz) => {
        // Create landmarks with varying palm orientation
        const landmarks: Point3D[] = [];
        for (let i = 0; i < 21; i++) {
          landmarks.push({ x: 0.5, y: 0.5, z: 0 });
        }
        landmarks[0] = { x: 0.5, y: 0.5, z: 0 }; // Wrist
        landmarks[9] = { x: 0.5 + dx * 0.1, y: 0.5 + dy * 0.1, z: dz * 0.1 }; // Middle MCP
        
        const angle = calculatePalmAngle(landmarks);
        
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThanOrEqual(180);
      }
    );

    /**
     * Property: validatePalmCone returns consistent results
     */
    test.prop([
      fc.double({ min: -0.5, max: 0.5, noNaN: true }), // palmZ
      fc.double({ min: 10, max: 80, noNaN: true }), // coneAngle
    ], { numRuns: 100 })(
      'validatePalmCone is consistent with isInCone',
      (palmZ, coneAngle) => {
        const landmarks = generateLandmarks(palmZ);
        const result = validatePalmCone(landmarks, coneAngle);
        
        expect(result.isValid).toBe(isInCone(result.palmAngle, coneAngle));
      }
    );
  });
});

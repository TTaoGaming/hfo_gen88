/**
 * 🎯 PALM CONE VALIDATION
 * 
 * Calculate palm angle from landmarks and validate against cone.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * 
 * Property 2: Palm cone filtering
 * For any palm angle greater than the configured cone angle,
 * the gesture SHALL be treated as invalid (no state transition).
 * 
 * Validates: Requirements 1.5, 3.3
 */

import type { Point3D } from '../../contracts/schemas.js';
import { LANDMARK } from '../../contracts/schemas.js';

/**
 * Calculate palm angle from landmarks
 * 
 * Palm normal is approximated by the vector from wrist to middle MCP.
 * Camera normal is (0, 0, -1) (pointing into the screen).
 * 
 * @param landmarks - Array of 21 hand landmarks
 * @returns Palm angle in degrees from camera normal (0 = facing camera)
 */
export function calculatePalmAngle(landmarks: Point3D[]): number {
  if (landmarks.length < 21) {
    throw new Error('Expected 21 landmarks');
  }

  const wrist = landmarks[LANDMARK.WRIST];
  const middleMcp = landmarks[LANDMARK.MIDDLE_MCP];

  // Palm normal approximation: wrist to middle_mcp vector
  const palmNormal = {
    x: middleMcp.x - wrist.x,
    y: middleMcp.y - wrist.y,
    z: middleMcp.z - wrist.z,
  };

  // Camera normal is (0, 0, -1)
  // Dot product with camera normal: palmNormal · (0, 0, -1) = -palmNormal.z
  const dot = -palmNormal.z;

  // Magnitude of palm normal
  const mag = Math.sqrt(
    palmNormal.x ** 2 + palmNormal.y ** 2 + palmNormal.z ** 2
  );

  // Avoid division by zero
  if (mag < 0.0001) {
    return 90; // Perpendicular if no clear direction
  }

  // Angle in radians, then convert to degrees
  const cosAngle = Math.max(-1, Math.min(1, dot / mag)); // Clamp for numerical stability
  const angleRadians = Math.acos(cosAngle);
  const angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
}

/**
 * Check if palm is within the valid cone angle
 * 
 * @param palmAngle - Palm angle in degrees
 * @param coneAngle - Maximum allowed angle in degrees (default 45)
 * @returns true if palm is facing camera within cone
 */
export function isInCone(palmAngle: number, coneAngle: number = 45): boolean {
  return palmAngle <= coneAngle;
}

/**
 * Validate gesture based on palm cone
 * 
 * @param landmarks - Array of 21 hand landmarks
 * @param coneAngle - Maximum allowed angle in degrees
 * @returns Object with palmAngle and isValid
 */
export function validatePalmCone(
  landmarks: Point3D[],
  coneAngle: number = 45
): { palmAngle: number; isValid: boolean } {
  const palmAngle = calculatePalmAngle(landmarks);
  const isValid = isInCone(palmAngle, coneAngle);
  return { palmAngle, isValid };
}

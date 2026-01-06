/**
 * 🕷️ PORT 7: SPIDER SOVEREIGN — TTV ENGINE
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Total Tool Virtualization & Cognitive Liberation
 * Provenance: hot_obsidian_sandbox/bronze/P7_TTV_KINETIC.md
 * 
 * The TTV Engine orchestrates the virtualization of analog tools.
 * It coordinates sensor fusion, interaction detection, and action generation.
 */

import { z } from 'zod';
import {
    Point3D,
    Point3DSchema,
    VirtualizedTool,
    VirtualizedToolSchema,
    FusedState,
    FusedStateSchema,
    InteractionEvent,
    InteractionEventSchema,
    TTVAction,
    TTVActionSchema,
    TTVSession,
    TTVSessionSchema,
    InteractiveRegion,
    SkillAssessment,
    SkillAssessmentSchema,
    ReferenceRecording,
} from './ttv-contracts.js';

// =============================================================================
// GEOMETRY UTILITIES
// =============================================================================

/**
 * Calculate distance between two 3D points
 */
export function distance3D(a: Point3D, b: Point3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if a point is inside a rectangular region (2D, ignoring Z)
 */
export function pointInRectangle(point: Point3D, vertices: Point3D[]): boolean {
    if (vertices.length < 4) return false;
    
    // Simple bounding box check (assumes axis-aligned rectangle)
    const minX = Math.min(...vertices.map(v => v.x));
    const maxX = Math.max(...vertices.map(v => v.x));
    const minY = Math.min(...vertices.map(v => v.y));
    const maxY = Math.max(...vertices.map(v => v.y));
    
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

/**
 * Check if a point is inside a circular region
 */
export function pointInCircle(point: Point3D, center: Point3D, radius: number): boolean {
    const dist = distance3D(point, center);
    return dist <= radius;
}

/**
 * Check if a point is inside a polygon (2D, ray casting algorithm)
 */
export function pointInPolygon(point: Point3D, vertices: Point3D[]): boolean {
    let inside = false;
    const n = vertices.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        
        if (((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
}

// =============================================================================
// TTV ENGINE
// =============================================================================

export interface TTVEngineConfig {
    touchThresholdZ: number; // Z distance to consider as "touching"
    dwellTimeMs: number; // Default dwell time for dwell triggers
    velocitySmoothing: number; // Smoothing factor for velocity calculation
}

const DEFAULT_CONFIG: TTVEngineConfig = {
    touchThresholdZ: 0.01, // 1cm
    dwellTimeMs: 500,
    velocitySmoothing: 0.3,
};

/**
 * The TTV Engine orchestrates Total Tool Virtualization.
 * 
 * It implements the PREY/8 tactical loop:
 * - P (Perceive): Receive fused sensor state
 * - R (React): Detect interactions with regions
 * - E (Execute): Generate actions
 * - Y (Yield): Emit actions to output
 */
export class TTVEngine {
    private tool: VirtualizedTool;
    private config: TTVEngineConfig;
    private activeInteractions: Map<string, InteractionEvent> = new Map();
    private dwellTimers: Map<string, number> = new Map();
    private lastState: FusedState | null = null;
    private eventIdCounter = 0;
    private actionIdCounter = 0;

    constructor(tool: VirtualizedTool, config: Partial<TTVEngineConfig> = {}) {
        this.tool = VirtualizedToolSchema.parse(tool);
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Generate a unique event ID
     */
    private generateEventId(): string {
        return `event_${++this.eventIdCounter}_${Date.now()}`;
    }

    /**
     * Generate a unique action ID
     */
    private generateActionId(): string {
        return `action_${++this.actionIdCounter}_${Date.now()}`;
    }

    /**
     * Check if a point is inside a region
     */
    private pointInRegion(point: Point3D, region: InteractiveRegion): boolean {
        switch (region.type) {
            case 'rectangle':
                return pointInRectangle(point, region.vertices);
            case 'circle':
                // For circle, first vertex is center, second defines radius
                const center = region.vertices[0];
                const radiusPoint = region.vertices[1];
                const radius = distance3D(center, radiusPoint);
                return pointInCircle(point, center, radius);
            case 'polygon':
                return pointInPolygon(point, region.vertices);
            default:
                return false;
        }
    }

    /**
     * Check if a point is "touching" (Z below threshold)
     */
    private isTouching(point: Point3D): boolean {
        return Math.abs(point.z) <= this.config.touchThresholdZ;
    }

    /**
     * PREY/8 - Perceive: Process a fused sensor state
     */
    public perceive(state: FusedState): InteractionEvent[] {
        const validState = FusedStateSchema.parse(state);
        const events: InteractionEvent[] = [];
        const now = validState.timestamp;

        // Check right hand interactions
        if (validState.handPoses.right) {
            const handPos = validState.handPoses.right.position;
            events.push(...this.detectInteractions('right_hand', handPos, now));
        }

        // Check left hand interactions
        if (validState.handPoses.left) {
            const handPos = validState.handPoses.left.position;
            events.push(...this.detectInteractions('left_hand', handPos, now));
        }

        // Check prop interactions
        for (const prop of validState.propPoses) {
            events.push(...this.detectInteractions(prop.propId, prop.pose.position, now));
        }

        this.lastState = validState;
        return events;
    }

    /**
     * Detect interactions for a single tracked point
     */
    private detectInteractions(trackerId: string, position: Point3D, timestamp: number): InteractionEvent[] {
        const events: InteractionEvent[] = [];
        const touching = this.isTouching(position);

        for (const region of this.tool.regions) {
            const inRegion = this.pointInRegion(position, region);
            const interactionKey = `${trackerId}_${region.id}`;
            const wasActive = this.activeInteractions.has(interactionKey);

            if (region.triggerType === 'touch') {
                if (inRegion && touching && !wasActive) {
                    // Touch start
                    const event = this.createInteractionEvent('touch_start', region.id, position, timestamp);
                    events.push(event);
                    this.activeInteractions.set(interactionKey, event);
                } else if ((!inRegion || !touching) && wasActive) {
                    // Touch end
                    const event = this.createInteractionEvent('touch_end', region.id, position, timestamp);
                    events.push(event);
                    this.activeInteractions.delete(interactionKey);
                }
            } else if (region.triggerType === 'hover') {
                if (inRegion && !wasActive) {
                    // Hover enter
                    const event = this.createInteractionEvent('hover_enter', region.id, position, timestamp);
                    events.push(event);
                    this.activeInteractions.set(interactionKey, event);
                } else if (!inRegion && wasActive) {
                    // Hover exit
                    const event = this.createInteractionEvent('hover_exit', region.id, position, timestamp);
                    events.push(event);
                    this.activeInteractions.delete(interactionKey);
                }
            } else if (region.triggerType === 'dwell') {
                if (inRegion && !this.dwellTimers.has(interactionKey)) {
                    // Start dwell timer
                    this.dwellTimers.set(interactionKey, timestamp);
                } else if (inRegion && this.dwellTimers.has(interactionKey)) {
                    // Check if dwell complete
                    const startTime = this.dwellTimers.get(interactionKey)!;
                    const dwellTime = region.dwellTimeMs || this.config.dwellTimeMs;
                    if (timestamp - startTime >= dwellTime && !wasActive) {
                        const event = this.createInteractionEvent('dwell_complete', region.id, position, timestamp);
                        events.push(event);
                        this.activeInteractions.set(interactionKey, event);
                    }
                } else if (!inRegion) {
                    // Reset dwell timer
                    this.dwellTimers.delete(interactionKey);
                    this.activeInteractions.delete(interactionKey);
                }
            }
        }

        return events;
    }

    /**
     * Create an interaction event
     */
    private createInteractionEvent(
        type: InteractionEvent['type'],
        regionId: string,
        position: Point3D,
        timestamp: number
    ): InteractionEvent {
        return InteractionEventSchema.parse({
            id: this.generateEventId(),
            timestamp,
            type,
            regionId,
            toolId: this.tool.id,
            position,
        });
    }

    /**
     * PREY/8 - React: Generate actions from interaction events
     */
    public react(events: InteractionEvent[]): TTVAction[] {
        const actions: TTVAction[] = [];

        for (const event of events) {
            const region = this.tool.regions.find(r => r.id === event.regionId);
            if (!region) continue;

            // Generate actions based on tool type and region semantic role
            if (this.tool.type === 'piano' && region.semanticRole.startsWith('piano_key_')) {
                const midiNote = parseInt(region.semanticRole.replace('piano_key_', ''), 10);
                
                if (event.type === 'touch_start') {
                    actions.push(this.createMidiNoteOn(midiNote, event.pressure || 0.8, event.timestamp));
                } else if (event.type === 'touch_end') {
                    actions.push(this.createMidiNoteOff(midiNote, event.timestamp));
                }
            } else if (this.tool.type === 'joystick') {
                // Joystick actions would be generated from pose, not touch events
                // This is handled separately in processJoystickPose
            } else {
                // Generic action for other tool types
                actions.push(this.createGenericAction(event));
            }
        }

        return actions;
    }

    /**
     * Create a MIDI note-on action
     */
    private createMidiNoteOn(note: number, pressure: number, timestamp: number): TTVAction {
        return TTVActionSchema.parse({
            id: this.generateActionId(),
            timestamp,
            type: 'midi_note',
            payload: {
                note,
                velocity: Math.round(pressure * 127),
                channel: 0,
                on: true,
            },
        });
    }

    /**
     * Create a MIDI note-off action
     */
    private createMidiNoteOff(note: number, timestamp: number): TTVAction {
        return TTVActionSchema.parse({
            id: this.generateActionId(),
            timestamp,
            type: 'midi_note',
            payload: {
                note,
                velocity: 0,
                channel: 0,
                on: false,
            },
        });
    }

    /**
     * Create a generic action
     */
    private createGenericAction(event: InteractionEvent): TTVAction {
        return TTVActionSchema.parse({
            id: this.generateActionId(),
            timestamp: event.timestamp,
            type: 'visual_feedback',
            payload: {
                eventType: event.type,
                regionId: event.regionId,
                position: event.position,
            },
        });
    }

    /**
     * PREY/8 - Execute & Yield: Full processing pipeline
     */
    public process(state: FusedState): TTVAction[] {
        const events = this.perceive(state);
        return this.react(events);
    }

    /**
     * Get current active interactions
     */
    public getActiveInteractions(): InteractionEvent[] {
        return Array.from(this.activeInteractions.values());
    }

    /**
     * Get the tool definition
     */
    public getTool(): VirtualizedTool {
        return this.tool;
    }

    /**
     * Reset engine state
     */
    public reset(): void {
        this.activeInteractions.clear();
        this.dwellTimers.clear();
        this.lastState = null;
    }
}

// =============================================================================
// SKILL ASSESSMENT ENGINE
// =============================================================================

/**
 * Compare a student's performance to a reference recording
 */
export function assessSkill(
    studentFrames: FusedState[],
    studentEvents: InteractionEvent[],
    reference: ReferenceRecording
): SkillAssessment {
    // Calculate accuracy (position deviation)
    let totalDeviation = 0;
    let deviationCount = 0;
    
    for (let i = 0; i < Math.min(studentFrames.length, reference.frames.length); i++) {
        const studentHand = studentFrames[i].handPoses.right;
        const refHand = reference.frames[i].handPoses.right;
        
        if (studentHand && refHand) {
            totalDeviation += distance3D(studentHand.position, refHand.position);
            deviationCount++;
        }
    }
    
    const avgDeviation = deviationCount > 0 ? totalDeviation / deviationCount : 1;
    const accuracy = Math.max(0, Math.min(100, 100 - avgDeviation * 1000)); // Scale to 0-100

    // Calculate timing (event timing deviation)
    let timingScore = 100;
    if (studentEvents.length > 0 && reference.interactions.length > 0) {
        const studentTouchStarts = studentEvents.filter(e => e.type === 'touch_start');
        const refTouchStarts = reference.interactions.filter(e => e.type === 'touch_start');
        
        let timingDeviation = 0;
        const minEvents = Math.min(studentTouchStarts.length, refTouchStarts.length);
        
        for (let i = 0; i < minEvents; i++) {
            const studentTime = studentTouchStarts[i].timestamp;
            const refTime = refTouchStarts[i].timestamp;
            timingDeviation += Math.abs(studentTime - refTime);
        }
        
        const avgTimingDev = minEvents > 0 ? timingDeviation / minEvents : 1000;
        timingScore = Math.max(0, Math.min(100, 100 - avgTimingDev / 10)); // 10ms = 1 point
    }

    // Calculate smoothness (velocity variance)
    let smoothnessScore = 100;
    // Simplified: just use confidence as proxy for smoothness
    const avgConfidence = studentFrames.reduce((sum, f) => sum + f.confidence, 0) / studentFrames.length;
    smoothnessScore = avgConfidence * 100;

    // Overall score (weighted average)
    const overall = accuracy * 0.4 + timingScore * 0.4 + smoothnessScore * 0.2;

    return SkillAssessmentSchema.parse({
        id: `assessment_${Date.now()}`,
        timestamp: Date.now(),
        studentId: 'student_1', // Would come from session
        referenceId: reference.id,
        toolId: reference.toolId,
        scores: {
            accuracy: Math.round(accuracy),
            timing: Math.round(timingScore),
            smoothness: Math.round(smoothnessScore),
            overall: Math.round(overall),
        },
        feedback: generateFeedback(accuracy, timingScore, smoothnessScore),
    });
}

/**
 * Generate feedback based on scores
 */
function generateFeedback(accuracy: number, timing: number, smoothness: number): SkillAssessment['feedback'] {
    const feedback: SkillAssessment['feedback'] = [];
    const now = Date.now();

    if (accuracy < 70) {
        feedback.push({
            timestamp: now,
            type: 'error',
            message: 'Position accuracy needs improvement. Focus on hitting the correct regions.',
        });
    } else if (accuracy < 85) {
        feedback.push({
            timestamp: now,
            type: 'suggestion',
            message: 'Good positioning! Try to be more precise with your finger placement.',
        });
    } else {
        feedback.push({
            timestamp: now,
            type: 'praise',
            message: 'Excellent position accuracy!',
        });
    }

    if (timing < 70) {
        feedback.push({
            timestamp: now,
            type: 'error',
            message: 'Timing needs work. Try to match the rhythm of the reference.',
        });
    } else if (timing < 85) {
        feedback.push({
            timestamp: now,
            type: 'suggestion',
            message: 'Good timing! Practice with a metronome to improve further.',
        });
    }

    if (smoothness < 70) {
        feedback.push({
            timestamp: now,
            type: 'warning',
            message: 'Movements are jerky. Try to relax and move more fluidly.',
        });
    }

    return feedback;
}

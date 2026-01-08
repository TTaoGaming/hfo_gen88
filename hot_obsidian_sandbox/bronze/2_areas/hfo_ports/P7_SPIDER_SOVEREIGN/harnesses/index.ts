export * from './harness.interface';
export { h0Sense } from './h0-sense';
export { h1Fuse } from './h1-fuse';
export { h2Shape } from './h2-shape';
export { h3Deliver } from './h3-deliver';
export { h4Disrupt } from './h4-disrupt';
export { h5Immunize } from './h5-immunize';
export { h6Store } from './h6-store';
export { h7Decide } from './h7-decide';

// SOTA Benchmarks - hard questions from established benchmarks
export { 
  sotaSimpleQA, 
  sotaGSM8K, 
  sotaGPQA, 
  sotaHumanEval, 
  sotaBBH,
  ALL_SOTA_HARNESSES,
} from './sota-benchmarks';

// HLE-style HARD benchmarks - models score <10%
export {
  hleMath,
  hlePhysics,
  hleChemistry,
  hleCS,
  hleBiology,
  hleHard,
  ALL_HLE_HARNESSES,
} from './hle-hard';

import { Harness } from './harness.interface';
import { h0Sense } from './h0-sense';
import { h1Fuse } from './h1-fuse';
import { h2Shape } from './h2-shape';
import { h3Deliver } from './h3-deliver';
import { h4Disrupt } from './h4-disrupt';
import { h5Immunize } from './h5-immunize';
import { h6Store } from './h6-store';
import { h7Decide } from './h7-decide';
import { ALL_SOTA_HARNESSES } from './sota-benchmarks';
import { ALL_HLE_HARNESSES } from './hle-hard';

export const ALL_HARNESSES: Harness[] = [
  h0Sense,
  h1Fuse,
  h2Shape,
  h3Deliver,
  h4Disrupt,
  h5Immunize,
  h6Store,
  h7Decide,
];

// SOTA harnesses for orchestration testing (harder, more differentiation)
export const SOTA_HARNESSES: Harness[] = ALL_SOTA_HARNESSES;

// HLE harnesses - HARDEST benchmarks, models score <10%
export const HLE_HARNESSES: Harness[] = ALL_HLE_HARNESSES;

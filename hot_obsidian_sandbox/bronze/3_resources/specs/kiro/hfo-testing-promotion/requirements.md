# Requirements Document

## Introduction

This specification defines the testing and promotion requirements for extracting MAP-ELITE components from bronze to silver tier in the HFO Gen 88 Medallion architecture. The goal is to establish formal correctness guarantees through mutation testing and property-based testing before promotion.

## Glossary

- **Ledger**: Hash-chained JSONL append-only log for evaluation results with cryptographic integrity verification
- **Harness**: A test suite containing prompts and scoring functions for evaluating LLM capabilities
- **Fitness**: Weighted aggregate score computed from individual harness results
- **Model_Client**: Unified abstraction layer for LLM API calls (Ollama/OpenRouter)
- **Runner**: Concurrent orchestration engine for executing evaluations
- **Mutation_Testing**: Testing technique that introduces small code changes (mutants) to verify test suite effectiveness
- **Property_Based_Testing**: Testing technique using randomly generated inputs to verify universal properties
- **Silver_Promotion**: Process of moving verified code from bronze to silver tier with full test coverage

## Requirements

### Requirement 1: Ledger Integrity

**User Story:** As a system operator, I want the evaluation ledger to maintain cryptographic integrity, so that I can trust historical results have not been tampered with.

#### Acceptance Criteria

1. WHEN an entry is appended to the Ledger, THE Ledger SHALL compute a SHA-256 hash of the entry combined with the previous hash
2. WHEN the Ledger is verified, THE Ledger SHALL detect any entry where the hash chain is broken
3. WHEN the Ledger is empty, THE Ledger SHALL use a genesis hash of '0000000000000000'
4. FOR ALL valid Ledger entries, appending then reading SHALL return the same entry (round-trip property)
5. FOR ALL Ledger sequences, verification SHALL pass if and only if no entries have been modified

### Requirement 2: Schema Validation

**User Story:** As a developer, I want all evaluation data to be validated against Zod schemas, so that I can catch malformed data early.

#### Acceptance Criteria

1. WHEN a HarnessResult is created, THE Schema SHALL validate harness_id is between 0 and 7
2. WHEN a HarnessResult is created, THE Schema SHALL validate normalized score is between 0 and 1
3. WHEN a HarnessResult is created, THE Schema SHALL validate timestamp is ISO 8601 format
4. IF invalid data is provided, THEN THE Schema SHALL return descriptive error messages
5. FOR ALL valid HarnessResult objects, serializing then parsing SHALL produce an equivalent object

### Requirement 3: Fitness Computation

**User Story:** As an evaluator, I want fitness scores computed consistently with configurable weights, so that I can compare models fairly.

#### Acceptance Criteria

1. WHEN computing fitness with equal weights, THE Fitness_Calculator SHALL return the arithmetic mean of harness scores
2. WHEN computing fitness with custom weights, THE Fitness_Calculator SHALL return the weighted average
3. WHEN no results are provided, THE Fitness_Calculator SHALL return fitness of 0
4. FOR ALL fitness computations, the result SHALL be between 0 and 1
5. FOR ALL harness results, fitness SHALL be idempotent (computing twice yields same result)

### Requirement 4: Model Client Abstraction

**User Story:** As a developer, I want a unified interface for calling different LLM providers, so that I can switch providers without changing evaluation code.

#### Acceptance Criteria

1. WHEN a model name contains '/', THE Model_Client SHALL route to OpenRouter
2. WHEN a model name does not contain '/', THE Model_Client SHALL route to Ollama
3. WHEN an API call succeeds, THE Model_Client SHALL return response text and duration
4. IF an API call fails, THEN THE Model_Client SHALL propagate the error with context
5. FOR ALL model names, provider detection SHALL be deterministic

### Requirement 5: Concurrent Execution

**User Story:** As an operator, I want evaluations to run concurrently with controlled parallelism, so that batch testing completes quickly without overwhelming APIs.

#### Acceptance Criteria

1. WHEN running evaluations, THE Runner SHALL limit concurrent requests via Semaphore
2. WHEN a prompt fails, THE Runner SHALL record the error and continue with remaining prompts
3. WHEN all harnesses complete, THE Runner SHALL aggregate results into a FitnessReport
4. FOR ALL batch runs, the total prompts executed SHALL equal harnesses × prompts_per_harness
5. FOR ALL concurrent executions, the Semaphore SHALL never allow more than N concurrent operations

### Requirement 6: Mutation Testing Coverage

**User Story:** As a quality engineer, I want mutation testing to verify test suite effectiveness, so that I can trust tests catch real bugs.

#### Acceptance Criteria

1. WHEN mutation testing runs on Ledger, THE Mutation_Tester SHALL achieve >80% mutation score
2. WHEN mutation testing runs on Fitness, THE Mutation_Tester SHALL achieve >80% mutation score
3. WHEN mutation testing runs on Schemas, THE Mutation_Tester SHALL achieve >80% mutation score
4. IF a mutant survives, THEN THE Mutation_Tester SHALL report the surviving mutant location
5. WHEN all mutation tests pass threshold, THE Component SHALL be eligible for silver promotion

### Requirement 7: Property-Based Test Coverage

**User Story:** As a developer, I want property-based tests to verify universal invariants, so that edge cases are automatically discovered.

#### Acceptance Criteria

1. WHEN property tests run, THE Test_Suite SHALL execute minimum 100 iterations per property
2. WHEN a property fails, THE Test_Suite SHALL report the minimal failing example (shrinking)
3. FOR ALL Ledger operations, the hash-chain property SHALL hold
4. FOR ALL Schema validations, the round-trip property SHALL hold
5. FOR ALL Fitness computations, the bounded-output property SHALL hold

### Requirement 8: Silver Promotion Gate

**User Story:** As a release manager, I want clear promotion criteria, so that only verified code enters silver tier.

#### Acceptance Criteria

1. WHEN promoting to silver, THE Gate SHALL require all unit tests passing
2. WHEN promoting to silver, THE Gate SHALL require mutation score >80%
3. WHEN promoting to silver, THE Gate SHALL require all property tests passing
4. WHEN promoting to silver, THE Gate SHALL require test file co-located with implementation
5. IF any gate fails, THEN THE Promotion SHALL be blocked with specific failure reason

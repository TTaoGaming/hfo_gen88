# Requirements Document

## Introduction

The BFT Swarm Reporter is a unified AI voice that synthesizes 8 parallel model responses into a single coherent report. It uses Byzantine Fault Tolerant (BFT) consensus with confidence weighting derived from MAP-ELITE evaluation scores. The pattern is "8 voices as 1" - scatter to 8 agents, gather via weighted consensus, compile into TTao's preferred report format.

## Glossary

- **Swarm_Reporter**: The unified system that orchestrates 8 parallel agents and compiles their output into a single report.
- **Voice_Agent**: One of 8 parallel LLM agents that processes a query and returns a response with confidence.
- **Compiler_Agent**: The single aggregator agent that synthesizes 8 voice responses into the final report.
- **Confidence_Weight**: A numerical weight (0-100) derived from the agent's MAP-ELITE fitness score.
- **BFT_Consensus**: Byzantine Fault Tolerant consensus mechanism that tolerates up to 2 faulty agents (f < n/3).
- **Report_Format**: TTao's preferred structured output format for synthesized intelligence.
- **MAP_ELITE_Score**: Pre-computed fitness score from model evaluation harnesses (0-100%).

## Requirements

### Requirement 1: Parallel Voice Scatter

**User Story:** As a user, I want to scatter my query to 8 parallel voice agents, so that I get diverse perspectives on the same question.

#### Acceptance Criteria

1. WHEN a query is submitted to the Swarm_Reporter, THE Swarm_Reporter SHALL dispatch the query to exactly 8 Voice_Agents in parallel.
2. WHEN dispatching to Voice_Agents, THE Swarm_Reporter SHALL use the MAP-ELITE Best 8 model roster.
3. WHEN a Voice_Agent responds, THE response SHALL include both the answer content and a self-reported confidence (0-100).
4. IF a Voice_Agent fails to respond within 30 seconds, THEN THE Swarm_Reporter SHALL mark that voice as ERROR with confidence 0.
5. WHEN all Voice_Agents have responded or timed out, THE Swarm_Reporter SHALL proceed to the gather phase.

### Requirement 2: Weighted Confidence Scoring

**User Story:** As a user, I want voice responses weighted by their proven evaluation scores, so that more reliable models have more influence on the final output.

#### Acceptance Criteria

1. THE Swarm_Reporter SHALL maintain a registry of MAP_ELITE_Scores for each model in the Best 8 roster.
2. WHEN computing final weights, THE Swarm_Reporter SHALL multiply self-reported confidence by the model's MAP_ELITE_Score.
3. WHEN a Voice_Agent reports confidence C and has MAP_ELITE_Score M, THE effective weight SHALL be computed as (C * M / 100).
4. THE Swarm_Reporter SHALL normalize all effective weights to sum to 1.0 for consensus calculation.

### Requirement 3: BFT Consensus Gathering

**User Story:** As a user, I want the system to reach consensus even if some agents give bad answers, so that the final output is robust to hallucinations.

#### Acceptance Criteria

1. WHEN gathering responses, THE Swarm_Reporter SHALL group semantically similar answers together.
2. WHEN grouping answers, THE Swarm_Reporter SHALL use normalized string comparison (lowercase, alphanumeric only).
3. THE Swarm_Reporter SHALL compute weighted vote totals for each answer group.
4. WHEN a single answer group has >50% of total weight, THE Swarm_Reporter SHALL select it as the weighted consensus.
5. IF no answer group has >50% weight, THEN THE Swarm_Reporter SHALL invoke the Compiler_Agent for critique-based selection.
6. THE Swarm_Reporter SHALL tolerate up to 2 faulty or ERROR responses (BFT: f < n/3 where n=8).

### Requirement 4: Compiler Agent Synthesis

**User Story:** As a user, I want a single compiler agent to synthesize all voices into my preferred report format, so that I get a unified, readable output.

#### Acceptance Criteria

1. WHEN consensus is reached, THE Compiler_Agent SHALL receive all 8 voice responses with their weights.
2. THE Compiler_Agent SHALL synthesize responses into TTao's Report_Format structure.
3. THE Report_Format SHALL include: Executive Summary, Key Findings (weighted), Dissenting Views, Confidence Assessment, and Sources.
4. WHEN synthesizing, THE Compiler_Agent SHALL preserve minority opinions in the Dissenting Views section.
5. THE Compiler_Agent SHALL output a final confidence score (0-100) for the synthesized report.
6. IF the Compiler_Agent detects high disagreement (agreement < 50%), THEN THE report SHALL include a WARNING flag.

### Requirement 5: Report Format Structure

**User Story:** As TTao, I want reports in my preferred format, so that I can quickly parse and act on synthesized intelligence.

#### Acceptance Criteria

1. THE Report_Format SHALL begin with a one-line Executive Summary (max 100 characters).
2. THE Report_Format SHALL include a Key Findings section with 3-5 bullet points, ordered by weight.
3. THE Report_Format SHALL include a Dissenting Views section listing minority opinions with their source models.
4. THE Report_Format SHALL include a Confidence Assessment with: overall confidence %, agreement ratio, and method used.
5. THE Report_Format SHALL include a Sources section listing all 8 models and their individual confidence scores.
6. THE Report_Format SHALL be valid Markdown.

### Requirement 6: Stigmergy Logging

**User Story:** As a system operator, I want all swarm operations logged to the blackboard, so that I can audit and debug the consensus process.

#### Acceptance Criteria

1. WHEN a scatter operation begins, THE Swarm_Reporter SHALL log a SCATTER event to the Obsidian Blackboard.
2. WHEN each Voice_Agent responds, THE Swarm_Reporter SHALL log the response with model, confidence, and latency.
3. WHEN consensus is computed, THE Swarm_Reporter SHALL log the method used and agreement ratio.
4. WHEN the final report is generated, THE Swarm_Reporter SHALL log a REPORT_COMPLETE event with overall confidence.
5. THE log format SHALL be JSONL with mandatory fields: ts, type, port (7), gen (88), hive ("HFO_GEN88").

### Requirement 7: Model Roster Configuration

**User Story:** As a system operator, I want to configure which models are in the Best 8 roster, so that I can swap models based on updated evaluations.

#### Acceptance Criteria

1. THE Swarm_Reporter SHALL load the Best 8 roster from a configuration source.
2. THE configuration SHALL include model ID, provider, and MAP_ELITE_Score for each model.
3. WHEN the roster is updated, THE Swarm_Reporter SHALL use the new roster for subsequent queries.
4. THE Swarm_Reporter SHALL validate that exactly 8 models are configured before accepting queries.
5. IF fewer than 8 models are configured, THEN THE Swarm_Reporter SHALL reject queries with a configuration error.

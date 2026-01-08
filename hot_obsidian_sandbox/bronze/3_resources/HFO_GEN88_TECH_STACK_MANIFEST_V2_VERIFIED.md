# 🛠️ HFO Gen 88 Tech Stack Manifest V2 — VERIFIED REALITY

**Topic**: Verified Tool & Dependency Audit (Truth vs Theater)  
**Provenance**: Physical verification via shell commands + web search grounding  
**Status**: BRONZE (Verified Audit Artifact)  
**Date**: 2026-01-07T17:40:00Z  
**Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)  

---

## 🔬 VERIFICATION METHODOLOGY

This manifest was created by:
1. **Web Search Grounding** — Latest 2026 MCP/LangGraph info from official sources
2. **Physical Verification** — Actual `npm list`, `pip list`, API calls
3. **Test Execution** — `npm test` to verify working vs broken

---

## 📊 Executive Summary — TRUTH vs THEATER

| Category | Claimed | Verified | Status |
|:---------|:--------|:---------|:-------|
| Node.js v22.13.0 | ✅ | ✅ VERIFIED | 🟢 TRUTH |
| npm packages (22) | ✅ | ✅ VERIFIED | 🟢 TRUTH |
| Python 3.13.1 | ✅ | ✅ VERIFIED | 🟢 TRUTH |
| pip packages (60+) | ✅ | ✅ VERIFIED | 🟢 TRUTH |
| MCP SDK (Python) | ❌ | ✅ v1.23.3 | 🟢 SURPRISE |
| Semgrep | ❌ | ✅ v1.146.0 | 🟢 SURPRISE |
| uvx | ✅ | ✅ v0.9.18 | 🟢 TRUTH |
| Ollama Server | ⚠️ | ✅ RUNNING (7 models) | 🟢 TRUTH |
| MCP Servers (Kiro) | ❌ | ❌ DISABLED | 🔴 THEATER |
| LangGraph (Node) | ❌ | ❌ NOT INSTALLED | 🔴 MISSING |
| NATS JetStream | ❌ | ❌ NOT INSTALLED | 🔴 MISSING |
| Vitest Tests | ✅ | ⚠️ 608/610 pass | 🟡 PARTIAL |

---

## 🟢 VERIFIED WORKING — Node.js Stack

### Runtime
```
Node.js: v22.13.0 ✅ VERIFIED
npm: installed ✅ VERIFIED
```

### Installed Packages (npm list --depth=0)
| Package | Version | Purpose | Status |
|:--------|:--------|:--------|:-------|
| `@dimforge/rapier2d-compat` | 0.19.3 | 2D physics engine | ✅ VERIFIED |
| `@opentelemetry/api` | 1.9.0 | Observability API | ✅ VERIFIED |
| `@opentelemetry/exporter-trace-otlp-http` | 0.208.0 | Trace export | ✅ VERIFIED |
| `@opentelemetry/instrumentation` | 0.208.0 | Auto-instrumentation | ✅ VERIFIED |
| `@opentelemetry/sdk-trace-base` | 2.2.0 | Trace SDK | ✅ VERIFIED |
| `@opentelemetry/sdk-trace-node` | 2.2.0 | Node.js tracing | ✅ VERIFIED |
| `@stryker-mutator/core` | 8.7.1 | Mutation testing | ✅ VERIFIED |
| `@stryker-mutator/typescript-checker` | 8.7.1 | TS type checking | ✅ VERIFIED |
| `@stryker-mutator/vitest-runner` | 8.7.1 | Vitest integration | ✅ VERIFIED |
| `@temporalio/activity` | 1.14.0 | Temporal activities | ✅ VERIFIED |
| `@temporalio/client` | 1.14.0 | Temporal client | ✅ VERIFIED |
| `@temporalio/worker` | 1.14.0 | Temporal worker | ✅ VERIFIED |
| `@temporalio/workflow` | 1.14.0 | Temporal workflows | ✅ VERIFIED |
| `@types/js-yaml` | 4.0.9 | YAML types | ✅ VERIFIED |
| `duckdb` | 1.4.3 | Embedded OLAP DB | ✅ VERIFIED |
| `fast-check` | 4.5.3 | Property-based testing | ✅ VERIFIED |
| `husky` | 9.1.7 | Git hooks | ✅ VERIFIED |
| `js-yaml` | 4.1.1 | YAML parsing | ✅ VERIFIED |
| `tsx` | 4.21.0 | TypeScript execution | ✅ VERIFIED |
| `typescript` | 5.9.3 | TypeScript compiler | ✅ VERIFIED |
| `vitest` | 1.6.1 | Test runner | ✅ VERIFIED |
| `zod` | 3.25.76 | Schema validation | ✅ VERIFIED |

---

## 🟢 VERIFIED WORKING — Python Stack

### Runtime
```
Python: 3.13.1 ✅ VERIFIED
venv: .venv ✅ ACTIVE
pip: 25.3 ✅ VERIFIED
```

### Key Installed Packages (pip list)
| Package | Version | Purpose | Status |
|:--------|:--------|:--------|:-------|
| `mcp` | 1.23.3 | Model Context Protocol SDK | ✅ VERIFIED |
| `semgrep` | 1.146.0 | Static analysis | ✅ VERIFIED |
| `duckdb` | 1.4.3 | Embedded OLAP DB | ✅ VERIFIED |
| `pydantic` | 2.12.5 | Data validation | ✅ VERIFIED |
| `opentelemetry-api` | 1.37.0 | Observability | ✅ VERIFIED |
| `opentelemetry-sdk` | 1.37.0 | Tracing SDK | ✅ VERIFIED |
| `httpx` | 0.28.1 | HTTP client | ✅ VERIFIED |
| `uvicorn` | 0.40.0 | ASGI server | ✅ VERIFIED |
| `starlette` | 0.50.0 | Web framework | ✅ VERIFIED |
| `requests` | 2.32.5 | HTTP library | ✅ VERIFIED |
| `rich` | 13.5.3 | Terminal formatting | ✅ VERIFIED |
| `ruamel.yaml` | 0.19.1 | YAML parsing | ✅ VERIFIED |

---

## 🟢 VERIFIED WORKING — Ollama Local Models

```
Ollama Server: http://localhost:11434 ✅ RUNNING
```

### Installed Models (7 total)
| Model | Size | Family | Status |
|:------|:-----|:-------|:-------|
| `smollm2:135m` | 271MB | llama | ✅ AVAILABLE |
| `llama3.2:1b` | 1.3GB | llama | ✅ AVAILABLE |
| `phi3:mini` | 2.2GB | phi3 | ✅ AVAILABLE |
| `gemma3:1b` | 815MB | gemma3 | ✅ AVAILABLE |
| `qwen3:0.6b` | 523MB | qwen3 | ✅ AVAILABLE |
| `gemma3:4b` | 3.3GB | gemma3 | ✅ AVAILABLE |
| `qwen3:4b` | 2.5GB | qwen3 | ✅ AVAILABLE |

---

## 🟢 VERIFIED WORKING — uvx (MCP Server Runner)

```
uvx: v0.9.18 (2025-12-16) ✅ VERIFIED
```

Can run MCP servers via `uvx mcp-server-*` commands.

---

## 🔴 THEATER — MCP Servers NOT Configured

### Kiro User MCP Config (~/.kiro/settings/mcp.json)
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": true  // ❌ DISABLED!
    }
  }
}
```

### Missing MCP Servers (Per AGENTS.md SENTINEL GROUNDING)
| Server | Purpose | Required By | Status |
|:-------|:--------|:------------|:-------|
| `mcp-server-tavily` | SEARCH_GROUNDING | AGENTS.md Rule 7 | ❌ NOT CONFIGURED |
| `mcp-server-sequential-thinking` | THINKING_GROUNDING | AGENTS.md Rule 7 | ❌ NOT CONFIGURED |
| `mcp-server-memory` | MEMORY_GROUNDING | AGENTS.md Rule 7 | ❌ NOT CONFIGURED |
| `mcp-server-fetch` | URL fetching | P0 Lidless Legion | ⚠️ DISABLED |

### Why This Matters
The Red Regnant (P4) SCREAMS when grounding is missing:
```
MUTATION SCREAM: [REWARD_HACK] in SESSION
> SENTINEL_GROUNDING_FAILURE: Tavily Web Search was not utilized in this session.
> SENTINEL_GROUNDING_FAILURE: Sequential Thinking was not utilized in this session.
```

---

## 🔴 MISSING — LangGraph (Node.js)

### Web Search Findings (2026-01-07)
- LangGraph 1.0 alpha released (per [langchain.com blog](https://blog.langchain.com))
- Node.js package: `@langchain/langgraph` on npm
- Python package: `langgraph` on PyPI

### Current State
```
@langchain/langgraph: ❌ NOT INSTALLED
langgraph (Python): ❌ NOT INSTALLED
```

### Installation
```powershell
npm install @langchain/langgraph langchain
.\.venv\Scripts\pip install langgraph langchain
```

---

## 🔴 MISSING — NATS JetStream

### Current State
```
nats (Node.js): ❌ NOT INSTALLED
nats-py (Python): ❌ NOT INSTALLED
NATS Server: ❌ NOT RUNNING
```

### Installation
```powershell
npm install nats
.\.venv\Scripts\pip install nats-py
# Server: Download from https://nats.io/download/
```

---

## 🟡 PARTIAL — Test Suite

### Test Results (npm test)
```
Test Files:  1 failed | 30 passed | 1 skipped (32)
Tests:       608 passed | 2 skipped (610)
Duration:    2.52s
```

### Failed Test
```
FAIL: hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/src/stages/physics/one-euro-filter.test.ts
Error: Vitest failed to find the current suite (fast-check/vitest integration bug)
```

### Root Cause
The P0_GESTURE_MONOLITH has its own `node_modules/@fast-check/vitest` that conflicts with root.

---

## 🔑 API Keys Status

### .env File
| Key | Status | Verified |
|:----|:-------|:---------|
| `TAVILY_API_KEY` | ✅ SET | `tvly-dev-*` |
| `OPENROUTER_API_KEY` | ✅ SET | `sk-or-v1-*` |
| `OLLAMA_BASE_URL` | ✅ SET | `http://localhost:11434` |
| `OPENAI_API_KEY` | ❌ EMPTY | — |
| `ANTHROPIC_API_KEY` | ❌ EMPTY | — |

---

## 📋 IMMEDIATE ACTION ITEMS

### 1. Enable MCP Servers in Kiro (CRITICAL)
Edit `~/.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "tavily": {
      "command": "uvx",
      "args": ["mcp-server-tavily"],
      "env": { "TAVILY_API_KEY": "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" },
      "disabled": false,
      "autoApprove": ["search"]
    },
    "sequential-thinking": {
      "command": "uvx", 
      "args": ["mcp-server-sequential-thinking"],
      "disabled": false,
      "autoApprove": ["think"]
    },
    "memory": {
      "command": "uvx",
      "args": ["mcp-server-memory"],
      "disabled": false,
      "autoApprove": ["store", "retrieve"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false,
      "autoApprove": ["fetch"]
    }
  }
}
```

### 2. Install Missing Node.js Packages
```powershell
npm install @langchain/langgraph langchain nats
```

### 3. Install Missing Python Packages
```powershell
.\.venv\Scripts\pip install langgraph langchain nats-py tavily-python
```

### 4. Fix P0_GESTURE_MONOLITH Test
Either:
- Delete `hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/node_modules`
- Or exclude from vitest.root.config.ts

---

## 🏆 VERIFIED TECH STACK SUMMARY

### ✅ WORKING (22 items)
- Node.js v22.13.0 + 22 npm packages
- Python 3.13.1 + 60+ pip packages
- Ollama with 7 local models
- uvx v0.9.18 for MCP servers
- MCP SDK v1.23.3 (Python)
- Semgrep v1.146.0
- DuckDB v1.4.3 (both Node + Python)
- Temporal SDK v1.14.0
- OpenTelemetry stack
- Rapier2D physics
- Zod v3.25.76
- fast-check v4.5.3
- Stryker v8.7.1
- Vitest v1.6.1

### ❌ THEATER/MISSING (5 items)
- MCP servers in Kiro (DISABLED)
- LangGraph (NOT INSTALLED)
- NATS JetStream (NOT INSTALLED)
- OpenAI API key (EMPTY)
- Anthropic API key (EMPTY)

### 🟡 PARTIAL (1 item)
- Test suite (608/610 pass, 1 file broken)

---

## 🔗 Web Search Sources (2026-01-07)

| Topic | Source | Key Finding |
|:------|:-------|:------------|
| MCP Spec | [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-03-26) | v2025-06-18 latest |
| MCP Servers | [github.com/wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) | Curated list |
| LangGraph | [npmjs.com/@langchain/langgraph](https://www.npmjs.com/package/@langchain/langgraph) | 1.0 alpha available |
| LangChain | [github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) | v0.3.x on npm |

---

**Generated**: 2026-01-07T17:40:00Z  
**Agent**: Kiro  
**Verification**: Physical shell commands + web search  
**Hive**: HFO_GEN88  
**Port**: 0 (Observation) + 4 (Verification)

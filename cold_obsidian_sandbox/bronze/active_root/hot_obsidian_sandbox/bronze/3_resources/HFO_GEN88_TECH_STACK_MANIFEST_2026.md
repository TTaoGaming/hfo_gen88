# 🛠️ HFO Gen 88 Tech Stack Manifest — January 2026

**Topic**: Comprehensive Tool & Dependency Audit  
**Provenance**: Codebase crawl + AGENTS.md + LEGENDARY_COMMANDERS_V9.md  
**Status**: BRONZE (Audit Artifact)  
**Date**: 2026-01-07  
**Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)  

---

## 📊 Executive Summary

| Category | Installed | Missing | Status |
|:---------|:----------|:--------|:-------|
| Node.js Core | ✅ 14/14 | 0 | COMPLETE |
| Python venv | ⚠️ 1/4 | 3 | PARTIAL |
| MCP Servers | ❌ 0/5 | 5 | MISSING |
| AI Model APIs | ✅ 2/4 | 2 | PARTIAL |
| Orchestration | ⚠️ 1/3 | 2 | PARTIAL |

---

## 🟢 INSTALLED — Node.js Dependencies (package.json)

### Core Runtime
```json
{
  "name": "hfo-gen88-root",
  "version": "88.0.0",
  "type": "module"
}
```

### Dev Dependencies (Testing & Build)
| Package | Version | Purpose | Status |
|:--------|:--------|:--------|:-------|
| `@stryker-mutator/core` | ^8.0.0 | Mutation testing framework | ✅ INSTALLED |
| `@stryker-mutator/typescript-checker` | ^8.0.0 | TypeScript type checking for Stryker | ✅ INSTALLED |
| `@stryker-mutator/vitest-runner` | ^8.0.0 | Vitest integration for Stryker | ✅ INSTALLED |
| `@types/js-yaml` | ^4.0.9 | TypeScript types for js-yaml | ✅ INSTALLED |
| `duckdb` | ^1.4.3 | Embedded analytical database | ✅ INSTALLED |
| `fast-check` | ^4.5.3 | Property-based testing | ✅ INSTALLED |
| `husky` | ^9.1.7 | Git hooks | ✅ INSTALLED |
| `tsx` | ^4.7.0 | TypeScript execution | ✅ INSTALLED |
| `typescript` | ^5.3.3 | TypeScript compiler | ✅ INSTALLED |
| `vitest` | ^1.2.1 | Test runner | ✅ INSTALLED |
| `zod` | ^3.22.4 | Schema validation (Contract Law) | ✅ INSTALLED |

### Production Dependencies
| Package | Version | Purpose | Status |
|:--------|:--------|:--------|:-------|
| `@dimforge/rapier2d-compat` | ^0.19.3 | 2D physics (gesture smoothing) | ✅ INSTALLED |
| `@opentelemetry/api` | ^1.9.0 | Observability API | ✅ INSTALLED |
| `@opentelemetry/exporter-trace-otlp-http` | ^0.208.0 | Trace export | ✅ INSTALLED |
| `@opentelemetry/instrumentation` | ^0.208.0 | Auto-instrumentation | ✅ INSTALLED |
| `@opentelemetry/sdk-trace-base` | ^2.2.0 | Trace SDK | ✅ INSTALLED |
| `@opentelemetry/sdk-trace-node` | ^2.2.0 | Node.js tracing | ✅ INSTALLED |
| `@temporalio/activity` | ^1.14.0 | Temporal activities | ✅ INSTALLED |
| `@temporalio/client` | ^1.14.0 | Temporal client | ✅ INSTALLED |
| `@temporalio/worker` | ^1.14.0 | Temporal worker | ✅ INSTALLED |
| `@temporalio/workflow` | ^1.14.0 | Temporal workflows | ✅ INSTALLED |
| `js-yaml` | ^4.1.1 | YAML parsing | ✅ INSTALLED |

---

## 🔴 MISSING — MCP Servers (CRITICAL)

Per AGENTS.md SENTINEL GROUNDING rules, these MCP servers are REQUIRED but NOT CONFIGURED:

### Required MCP Servers
| Server | Purpose | Port | Status |
|:-------|:--------|:-----|:-------|
| `@anthropic/mcp-server-tavily` | Web search grounding (SEARCH_GROUNDING) | P0 | ❌ NOT INSTALLED |
| `@anthropic/mcp-server-sequential-thinking` | Reasoning chain (THINKING_GROUNDING) | P7 | ❌ NOT INSTALLED |
| `@anthropic/mcp-server-memory` | Knowledge graph (MEMORY_GROUNDING) | P6 | ❌ NOT INSTALLED |
| `mcp-server-fetch` | URL content fetching | P0 | ❌ NOT INSTALLED |
| `mcp-server-filesystem` | File system access | P3 | ❌ NOT INSTALLED |

### MCP Configuration Template
Create `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "tavily": {
      "command": "uvx",
      "args": ["mcp-server-tavily"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      },
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

---

## 🟡 PARTIAL — Python Environment

### Current State
```
Python: 3.13.1 (C:\Python313)
venv: .venv (active)
```

### Missing Python Packages
| Package | Purpose | Status |
|:--------|:--------|:-------|
| `tavily-python` | Direct Tavily API access | ❌ NOT INSTALLED |
| `langchain` | LLM orchestration | ❌ NOT INSTALLED |
| `langgraph` | Stateful AI agents | ❌ NOT INSTALLED |
| `nats-py` | NATS JetStream client | ❌ NOT INSTALLED |

### Installation Command
```powershell
.\.venv\Scripts\pip install tavily-python langchain langgraph nats-py
```

---

## 🔑 API Keys & Environment (.env)

### Configured
| Key | Status | Notes |
|:----|:-------|:------|
| `TAVILY_API_KEY` | ✅ SET | `tvly-dev-*` |
| `OPENROUTER_API_KEY` | ✅ SET | `sk-or-v1-*` |
| `OLLAMA_BASE_URL` | ✅ SET | `http://localhost:11434` |

### Missing/Empty
| Key | Status | Required For |
|:----|:-------|:-------------|
| `OPENAI_API_KEY` | ❌ EMPTY | GPT-4o-mini, GPT-5-nano |
| `ANTHROPIC_API_KEY` | ❌ EMPTY | Claude 3.5 Haiku |
| `NATS_URL` | ❌ MISSING | NATS JetStream stigmergy |
| `TEMPORAL_ADDRESS` | ❌ MISSING | Temporal.io workflows |

---

## 🧪 Testing Infrastructure

### Vitest Configs
| Config | Purpose | Status |
|:-------|:--------|:-------|
| `vitest.root.config.ts` | Root test runner | ✅ ACTIVE |
| `vitest.silver.config.ts` | Silver tier tests | ✅ ACTIVE |
| `vitest.harness.config.ts` | Eval harness tests | ✅ ACTIVE |
| `vitest.mutation.config.ts` | Mutation test support | ✅ ACTIVE |
| `vitest.p4.stryker.config.ts` | P4 Red Regnant tests | ✅ ACTIVE |
| `vitest.p4.integration.config.ts` | P4 integration tests | ✅ ACTIVE |

### Stryker Configs
| Config | Purpose | Status |
|:-------|:--------|:-------|
| `stryker.root.config.mjs` | Root mutation testing | ✅ ACTIVE |
| `stryker.silver.config.mjs` | Silver tier mutations | ✅ ACTIVE |
| `stryker.p4.config.mjs` | P4 Red Regnant mutations | ✅ ACTIVE |
| `stryker.p5.config.mjs` | P5 Pyre Praetorian mutations | ✅ ACTIVE |

### Property-Based Testing
| Library | Version | Usage |
|:--------|:--------|:------|
| `fast-check` | ^4.5.3 | All `*.property.test.ts` files |

---

## 🤖 AI Model Clients

### OpenRouter Models (Verified 2026-01-07)
```typescript
// TIER 1: Ultra-cheap ($0.01-0.05/M)
'openai/gpt-oss-20b'              // $0.016/M
'google/gemma-3n-e4b-it'          // $0.020/M - BEST CHEAP
'mistralai/mistral-nemo'          // $0.020/M
'openai/gpt-5-nano'               // $0.050/M

// TIER 2: Budget ($0.06-0.15/M)
'openai/gpt-4o-mini'              // $0.150/M - TOP PERFORMER
'meta-llama/llama-4-maverick'     // $0.150/M
'deepseek/deepseek-chat-v3.1'     // $0.150/M

// TIER 3: Value ($0.20-0.50/M)
'x-ai/grok-4.1-fast'              // $0.200/M - BEST MID
'google/gemini-3-flash-preview'   // $0.500/M
```

### Local Models (Ollama)
| Model | Status | Notes |
|:------|:-------|:------|
| Ollama Server | ⚠️ REQUIRES RUNNING | `http://localhost:11434` |

---

## 🏗️ Orchestration Infrastructure

### Temporal.io
| Component | Status | Notes |
|:----------|:-------|:------|
| SDK Packages | ✅ INSTALLED | `@temporalio/*` v1.14.0 |
| Temporal Server | ❌ NOT RUNNING | Requires `temporal server start-dev` |
| Worker | ❌ NOT CONFIGURED | Needs worker setup |

### NATS JetStream
| Component | Status | Notes |
|:----------|:-------|:------|
| Node.js Client | ❌ NOT INSTALLED | Need `nats` package |
| Python Client | ❌ NOT INSTALLED | Need `nats-py` package |
| NATS Server | ❌ NOT RUNNING | Requires `nats-server -js` |

---

## 📦 RECOMMENDED ADDITIONS — 2026 Tech Stack

### High Priority (Immediate)
```powershell
# Node.js packages
npm install nats glob semgrep

# Python packages (in venv)
.\.venv\Scripts\pip install tavily-python langgraph nats-py

# MCP servers (via uvx)
# Configure in .kiro/settings/mcp.json
```

### Medium Priority (Week 1)
| Tool | Purpose | Install |
|:-----|:--------|:--------|
| `semgrep` | Static analysis for deceptive patterns | `pip install semgrep` |
| `@langchain/langgraph` | Node.js LangGraph | `npm install @langchain/langgraph` |
| `glob` | File pattern matching | `npm install glob` |

### Low Priority (Future)
| Tool | Purpose | Notes |
|:-----|:--------|:------|
| `crew-ai` | Multi-agent orchestration | Alternative to LangGraph |
| `autogen` | Microsoft agent framework | Alternative to LangGraph |
| `dspy` | Programmatic LLM prompting | Stanford research |

---

## 🚨 FORBIDDEN COMMANDS (Per AGENTS.md)

| Command | Reason | Alternative |
|:--------|:-------|:------------|
| `npx stryker run` | Freezes on this system | Use CI workflow |
| `npm run stryker` | Freezes on this system | Use CI workflow |
| Any local Stryker | Freezes on this system | Use CI workflow |

---

## 📋 Installation Checklist

### Immediate Actions
- [ ] Create `.kiro/settings/mcp.json` with MCP server configs
- [ ] Install `uv` package manager: `pip install uv`
- [ ] Test MCP servers: `uvx mcp-server-tavily --help`
- [ ] Add missing npm packages: `npm install nats glob`
- [ ] Add missing pip packages: `pip install tavily-python langgraph nats-py`

### Infrastructure Setup
- [ ] Start Temporal dev server: `temporal server start-dev`
- [ ] Start NATS with JetStream: `nats-server -js`
- [ ] Verify Ollama running: `curl http://localhost:11434/api/tags`

### Verification
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run scream` — Red Regnant sings
- [ ] Verify MCP tools available in Kiro

---

## 🔗 References

| Resource | URL |
|:---------|:----|
| Temporal.io | https://temporal.io |
| MCP Protocol | https://modelcontextprotocol.io |
| LangGraph | https://langchain.com/langgraph |
| Stryker | https://stryker-mutator.io |
| DuckDB | https://duckdb.org |
| NATS | https://nats.io |
| OpenRouter | https://openrouter.ai |
| Tavily | https://tavily.com |

---

**Generated**: 2026-01-07  
**Agent**: Kiro  
**Hive**: HFO_GEN88  
**Port**: 0 (Observation)

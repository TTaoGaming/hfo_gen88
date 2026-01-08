# 🕷️ HFO MCP Server — Platform-Independent SDK Options

**Topic**: Building a Custom MCP Server for AI Agent Constraint Enforcement  
**Provenance**: Web search grounding + HFO Gen 88 architecture analysis  
**Status**: BRONZE (Architecture Decision Record)  
**Date**: 2026-01-07  
**Problem**: AI agents ignore constraints; need infrastructure-level enforcement  

---

## 🎯 The Core Problem

> "Constraint following is so weak" — ttao

AI agents are probabilistic engines. They will:
1. **Ignore explicit instructions** (INSTRUCTION_AMNESIA pattern)
2. **Create fallbacks** when tools fail silently
3. **Hallucinate** tool availability
4. **Bypass** architectural constraints

**Solution**: Move constraints from prompts to infrastructure. The MCP server becomes the **enforcement layer** — agents can only do what the server allows.

---

## 📊 Option Comparison Matrix

| Option | Language | IDE Support | Complexity | Enforcement Power | Time to MVP |
|:-------|:---------|:------------|:-----------|:------------------|:------------|
| **A: FastMCP (Python)** | Python | All | Low | High | 1-2 days |
| **B: FastMCP (TypeScript)** | TypeScript | All | Low | High | 1-2 days |
| **C: Official MCP SDK** | Python/TS | All | Medium | High | 3-5 days |
| **D: Governance-as-a-Service** | Any | All | High | Very High | 1-2 weeks |
| **E: Hybrid (MCP + Temporal)** | TypeScript | All | High | Maximum | 2-4 weeks |

---

## 🅰️ Option A: FastMCP (Python) — RECOMMENDED FOR MVP

### Why FastMCP?
- FastMCP 1.0 was incorporated into the official MCP SDK
- FastMCP 2.0 is actively maintained with advanced features
- You already have `mcp` v1.23.3 installed in your venv
- Pythonic, FastAPI-style decorators

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    HFO MCP Server (Python)                  │
├─────────────────────────────────────────────────────────────┤
│  @mcp.tool("hfo_write_file")                               │
│  def write_file(path: str, content: str) -> Result:        │
│      # ENFORCEMENT: Check medallion layer                   │
│      if path.startswith("silver/") or path.startswith("gold/"):
│          return Error("LOCKDOWN: Silver/Gold writes forbidden")
│      # ENFORCEMENT: Check root pollution                    │
│      if is_root_pollution(path):                           │
│          return Error("POLLUTION: Root writes forbidden")   │
│      # ENFORCEMENT: Log to blackboard                       │
│      log_to_blackboard({"type": "WRITE", "path": path})    │
│      return write_file_impl(path, content)                 │
├─────────────────────────────────────────────────────────────┤
│  Works with: Kiro, VS Code, Cursor, Claude Desktop, etc.   │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Skeleton
```python
# hot_obsidian_sandbox/bronze/mcp_server/hfo_server.py
from mcp.server.fastmcp import FastMCP
from pathlib import Path
import json
from datetime import datetime

mcp = FastMCP("HFO Gen 88")

# --- CONFIGURATION ---
WORKSPACE_ROOT = Path("C:/Dev/active/hfo_gen88")
BLACKBOARD = WORKSPACE_ROOT / "obsidianblackboard.jsonl"
FORBIDDEN_ROOTS = ["silver/", "gold/", "hot_obsidian_sandbox/silver/", "hot_obsidian_sandbox/gold/"]
ALLOWED_ROOT_FILES = ["AGENTS.md", "llms.txt", "obsidianblackboard.jsonl", "package.json", ...]

# --- ENFORCEMENT HELPERS ---
def log_to_blackboard(event: dict):
    event["ts"] = datetime.utcnow().isoformat() + "Z"
    event["hive"] = "HFO_GEN88"
    with open(BLACKBOARD, "a") as f:
        f.write(json.dumps(event) + "\n")

def check_medallion_lockdown(path: str) -> str | None:
    for forbidden in FORBIDDEN_ROOTS:
        if path.startswith(forbidden):
            return f"LOCKDOWN: Cannot write to {forbidden.rstrip('/')} without WARLOCK_APPROVAL"
    return None

def check_root_pollution(path: str) -> str | None:
    if "/" not in path:  # Root-level file
        if path not in ALLOWED_ROOT_FILES:
            return f"POLLUTION: {path} not in root whitelist"
    return None

# --- MCP TOOLS ---
@mcp.tool()
def hfo_write_file(path: str, content: str) -> str:
    """Write a file with HFO medallion enforcement."""
    # Enforcement layer
    if err := check_medallion_lockdown(path):
        log_to_blackboard({"type": "SCREAM", "mark": "LOCKDOWN_VIOLATION", "path": path})
        return f"❌ {err}"
    if err := check_root_pollution(path):
        log_to_blackboard({"type": "SCREAM", "mark": "POLLUTION_VIOLATION", "path": path})
        return f"❌ {err}"
    
    # Actual write
    full_path = WORKSPACE_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content, encoding="utf-8")
    
    log_to_blackboard({"type": "WRITE", "path": path, "size": len(content)})
    return f"✅ Wrote {len(content)} bytes to {path}"

@mcp.tool()
def hfo_read_file(path: str) -> str:
    """Read a file with logging."""
    full_path = WORKSPACE_ROOT / path
    if not full_path.exists():
        return f"❌ File not found: {path}"
    
    content = full_path.read_text(encoding="utf-8")
    log_to_blackboard({"type": "READ", "path": path, "size": len(content)})
    return content

@mcp.tool()
def hfo_scream(violation_type: str, file: str, message: str) -> str:
    """Red Regnant SCREAM - log a violation."""
    log_to_blackboard({
        "type": "SCREAM",
        "mark": f"MUTATION_SCREAM_VIOLATION",
        "violationType": violation_type,
        "file": file,
        "msg": message,
        "port": 4
    })
    return f"🔴 SCREAM logged: {violation_type} in {file}"

@mcp.tool()
def hfo_promote(artifact: str, from_layer: str, to_layer: str, mutation_score: float) -> str:
    """Request promotion with validation."""
    if mutation_score < 80:
        return f"❌ Mutation score {mutation_score}% below 80% minimum"
    if mutation_score > 98.99:
        return f"❌ Mutation score {mutation_score}% above 98.99% (Theater detected)"
    if to_layer in ["silver", "gold"]:
        return f"❌ LOCKDOWN: Promotion to {to_layer} requires WARLOCK_APPROVAL signal"
    
    log_to_blackboard({
        "type": "PROMOTION_REQUEST",
        "artifact": artifact,
        "from": from_layer,
        "to": to_layer,
        "mutationScore": mutation_score
    })
    return f"📋 Promotion request logged for {artifact}"

# --- RUN SERVER ---
if __name__ == "__main__":
    mcp.run()
```

### Installation & Config
```powershell
# Install FastMCP 2.0
.\.venv\Scripts\pip install fastmcp

# Run server (for testing)
.\.venv\Scripts\python hot_obsidian_sandbox/bronze/mcp_server/hfo_server.py
```

### MCP Config (works in ANY IDE)
```json
{
  "mcpServers": {
    "hfo": {
      "command": "C:/Dev/active/hfo_gen88/.venv/Scripts/python",
      "args": ["C:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/mcp_server/hfo_server.py"],
      "env": {},
      "disabled": false,
      "autoApprove": ["hfo_read_file", "hfo_scream"]
    }
  }
}
```

### Pros
- ✅ You already have MCP SDK installed
- ✅ FastAPI-style decorators (familiar)
- ✅ Works with ALL MCP-compatible IDEs
- ✅ Enforcement at infrastructure level
- ✅ 1-2 day MVP

### Cons
- ❌ Python process must be running
- ❌ No built-in durable execution

---

## 🅱️ Option B: FastMCP (TypeScript)

### Why TypeScript?
- Your codebase is primarily TypeScript
- Same enforcement patterns as Python
- npm package: `fastmcp`

### Implementation
```typescript
// hot_obsidian_sandbox/bronze/mcp_server/hfo-server.ts
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const server = new FastMCP('HFO Gen 88');

const WORKSPACE_ROOT = 'C:/Dev/active/hfo_gen88';
const BLACKBOARD = path.join(WORKSPACE_ROOT, 'obsidianblackboard.jsonl');

async function logToBlackboard(event: Record<string, unknown>) {
  const line = JSON.stringify({
    ...event,
    ts: new Date().toISOString(),
    hive: 'HFO_GEN88'
  }) + '\n';
  await fs.appendFile(BLACKBOARD, line);
}

server.addTool({
  name: 'hfo_write_file',
  description: 'Write a file with HFO medallion enforcement',
  parameters: z.object({
    path: z.string(),
    content: z.string()
  }),
  execute: async ({ path: filePath, content }) => {
    // ENFORCEMENT
    if (filePath.includes('silver/') || filePath.includes('gold/')) {
      await logToBlackboard({ type: 'SCREAM', mark: 'LOCKDOWN_VIOLATION', path: filePath });
      return { error: 'LOCKDOWN: Silver/Gold writes forbidden' };
    }
    
    const fullPath = path.join(WORKSPACE_ROOT, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    
    await logToBlackboard({ type: 'WRITE', path: filePath, size: content.length });
    return { success: true, path: filePath, size: content.length };
  }
});

server.start({ transportType: 'stdio' });
```

### Installation
```powershell
npm install fastmcp zod
npx tsx hot_obsidian_sandbox/bronze/mcp_server/hfo-server.ts
```

---

## 🅲️ Option C: Official MCP SDK

Use the official `@modelcontextprotocol/sdk` for maximum compatibility.

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({ name: 'hfo-gen88', version: '88.0.0' }, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'hfo_write_file', description: '...', inputSchema: {...} },
    { name: 'hfo_scream', description: '...', inputSchema: {...} }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Enforcement logic here
});
```

---

## 🅳️ Option D: Governance-as-a-Service (GaaS)

Based on the arxiv paper "A Multi-Agent Framework for AI System Compliance and Policy Enforcement":

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent (Any IDE)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ MCP Protocol
┌─────────────────────▼───────────────────────────────────────┐
│                 HFO Governance Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Policy      │  │ Audit       │  │ Enforcement │         │
│  │ Engine      │  │ Logger      │  │ Gate        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Actual Tools (File System, etc.)            │
└─────────────────────────────────────────────────────────────┘
```

### Policy Definition (YAML)
```yaml
# hfo_policies.yaml
policies:
  medallion_lockdown:
    description: "Prevent writes to Silver/Gold without approval"
    rules:
      - action: write
        path_pattern: "silver/**"
        effect: deny
        unless: signal == "WARLOCK_APPROVAL"
      - action: write
        path_pattern: "gold/**"
        effect: deny
        unless: signal == "WARLOCK_APPROVAL"
  
  root_pollution:
    description: "Prevent unauthorized root files"
    rules:
      - action: write
        path_pattern: "*"
        path_depth: 1
        effect: deny
        unless: path in ALLOWED_ROOT_FILES
  
  theater_detection:
    description: "Detect mutation score theater"
    rules:
      - action: promote
        condition: mutation_score > 98.99
        effect: deny
        reason: "Theater detected: mutation score too high"
```

---

## 🅴️ Option E: Hybrid (MCP + Temporal) — MAXIMUM ENFORCEMENT

Combine MCP for tool interface with Temporal for durable execution and audit trails.

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent (Any IDE)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ MCP Protocol
┌─────────────────────▼───────────────────────────────────────┐
│                 HFO MCP Server                              │
│  - Receives tool calls                                      │
│  - Validates against policies                               │
│  - Starts Temporal workflows for durable ops                │
└─────────────────────┬───────────────────────────────────────┘
                      │ Temporal Client
┌─────────────────────▼───────────────────────────────────────┐
│                 Temporal Server                             │
│  - Durable execution                                        │
│  - Automatic retry                                          │
│  - Full audit trail                                         │
│  - Human-in-the-loop approval                               │
└─────────────────────────────────────────────────────────────┘
```

### Benefits
- Every action is a durable workflow
- Full audit trail in Temporal UI
- Human approval gates for Silver/Gold promotion
- Automatic retry on failure
- Rollback capability

---

## 🎯 RECOMMENDATION

### For MVP (This Week): Option A — FastMCP (Python)

**Why:**
1. You already have `mcp` v1.23.3 installed
2. FastMCP 2.0 is the most mature framework
3. 1-2 day implementation
4. Works with ALL IDEs (Kiro, VS Code, Cursor, Claude Desktop)
5. Enforcement at infrastructure level = agents CAN'T bypass

### For Production (Next Month): Option E — Hybrid

**Why:**
1. Temporal provides durable execution (you already have SDK)
2. Full audit trail
3. Human-in-the-loop for critical operations
4. Maximum enforcement power

---

## 📋 Implementation Checklist (Option A)

### Day 1: Core Server
- [ ] Create `hot_obsidian_sandbox/bronze/mcp_server/` directory
- [ ] Install FastMCP: `pip install fastmcp`
- [ ] Implement `hfo_write_file` with medallion enforcement
- [ ] Implement `hfo_read_file` with logging
- [ ] Implement `hfo_scream` for violations
- [ ] Test locally: `python hfo_server.py`

### Day 2: Integration
- [ ] Create MCP config for Kiro (`~/.kiro/settings/mcp.json`)
- [ ] Create MCP config for VS Code (`.vscode/mcp.json`)
- [ ] Create MCP config for Cursor (`.cursor/mcp.json`)
- [ ] Test with each IDE
- [ ] Document in AGENTS.md

### Week 2: Advanced
- [ ] Add `hfo_promote` with approval workflow
- [ ] Add `hfo_run_tests` with mutation score validation
- [ ] Add `hfo_search` (wrap Tavily with logging)
- [ ] Add `hfo_think` (wrap sequential thinking with logging)

---

## 🔗 References

| Resource | URL |
|:---------|:----|
| FastMCP 2.0 | https://gofastmcp.com/ |
| FastMCP GitHub (Python) | https://github.com/jlowin/fastmcp |
| FastMCP GitHub (TypeScript) | https://github.com/punkpeye/fastmcp |
| MCP Specification | https://modelcontextprotocol.io/specification/2025-03-26 |
| Governance-as-a-Service Paper | https://arxiv.org/html/2508.18765v2 |
| AI Agent Guardrails Guide | https://galileo.ai/blog/ai-agent-guardrails-framework |

---

**Generated**: 2026-01-07  
**Agent**: Kiro  
**Hive**: HFO_GEN88  
**Port**: 7 (Spider Sovereign — Architecture Decision)

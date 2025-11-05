# Web-Ally Sub-Agents

This directory contains specialized sub-agent definitions for developing the Web-Ally browser extension.

## Agent Architecture

Each agent is a specialist responsible for a specific aspect of the extension. Agents work together in a coordinated pipeline:

```
┌─────────────┐
│Setup Agent  │ → Initialize project
└──────┬──────┘
       ↓
┌─────────────┐
│Scanner      │ → Analyze DOM and find issues
│Agent        │
└──────┬──────┘
       ↓
    ┌──┴───┬───────┬──────────┬──────────┐
    ↓      ↓       ↓          ↓          ↓
┌────────┐ ┌────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│Transform│ │ARIA│ │Structure│ │Keyboard│ │Performance│
│Agent   │ │Agent│ │Agent   │ │Agent   │ │Agent      │
└────────┘ └────┘ └────────┘ └────────┘ └────────────┘
    ↓      ↓       ↓          ↓          ↓
    └──────┴───┬───┴──────────┴──────────┘
               ↓
       ┌───────────────┐
       │Observer Agent │ → Monitor dynamic changes
       └───────┬───────┘
               ↓
       ┌───────────────┐
       │Testing Agent  │ → Validate everything works
       └───────┬───────┘
               ↓
       ┌───────────────┐
       │Demo Agent     │ → Prepare presentation
       └───────────────┘
```

## Agents Overview

### 1. **Setup Agent** (`setup-agent.md`)
- **When to use**: Day 1 - First thing
- **Purpose**: Initialize project, configure build system
- **Output**: Working dev environment

### 2. **Scanner Agent** (`scanner-agent.md`)
- **When to use**: Day 1 - After setup
- **Purpose**: Build DOM analysis engine
- **Output**: Issue detection system

### 3. **Transformer Agent** (`transformer-agent.md`)
- **When to use**: Day 1 - After scanner
- **Purpose**: Convert non-semantic to semantic HTML
- **Output**: Safe DOM transformation system

### 4. **Performance Agent** (`performance-agent.md`)
- **When to use**: Day 1 - In parallel with transformer
- **Purpose**: Optimize for speed and efficiency
- **Output**: Batch processing and scheduling system

### 5. **ARIA Agent** (`aria-agent.md`)
- **When to use**: Day 2 - First priority
- **Purpose**: Add all necessary ARIA attributes
- **Output**: Complete ARIA management system

### 6. **Structure Agent** (`structure-agent.md`)
- **When to use**: Day 2 - In parallel with ARIA
- **Purpose**: Fix page structure (landmarks, headings)
- **Output**: Structural improvement system

### 7. **Keyboard Agent** (`keyboard-agent.md`)
- **When to use**: Day 2 - After structure
- **Purpose**: Ensure keyboard accessibility
- **Output**: Full keyboard interaction support

### 8. **Observer Agent** (`observer-agent.md`)
- **When to use**: Day 2 - Final task
- **Purpose**: Handle dynamic content
- **Output**: MutationObserver system for SPAs

### 9. **Testing Agent** (`testing-agent.md`)
- **When to use**: Day 3 - First priority
- **Purpose**: Validate on real websites
- **Output**: Test results and metrics

### 10. **Demo Agent** (`demo-agent.md`)
- **When to use**: Day 3 - Final task
- **Purpose**: Prepare presentation materials
- **Output**: Demo videos, slides, documentation

## How to Use These Agents

### For Main Claude Instance

When delegating work to a sub-agent:

```markdown
I need to [task description]. Please work as the [Agent Name]
and follow the instructions in .claude/agents/[agent-file].md.

Context:
- Current project status: [from TASKS.md]
- Dependencies: [what's already built]
- Integration points: [what this connects to]

Remember to update TASKS.md when complete.
```

### For Sub-Agent Instances

When starting as a sub-agent:

1. Read your agent definition file
2. Read TASKS.md for current project status
3. Read CLAUDE.md for project context
4. Execute your tasks
5. Update TASKS.md with progress
6. Report completion and integration points

## Agent Coordination

### Parallel Work (Can run simultaneously)
- Transformer + Performance (Day 1)
- ARIA + Structure (Day 2)

### Sequential Work (Must run in order)
- Setup → Scanner → Transformer
- Structure → Keyboard
- All → Observer → Testing → Demo

### Shared Resources
- All agents use Scanner Agent's detection data
- All agents report to Performance Agent
- All agents update TASKS.md

## Success Criteria

Each agent has specific success criteria in their definition file. The project succeeds when:

1. ✅ Extension loads in Chrome without errors
2. ✅ Accessibility scores improve 50%+ on test sites
3. ✅ Screen readers work correctly
4. ✅ No functionality broken on any test site
5. ✅ No performance regression
6. ✅ Demo is compelling and works smoothly

## Communication Protocol

Agents should communicate through:
- **TASKS.md**: Task status and progress
- **Code comments**: Technical decisions and TODOs
- **Type definitions**: Interfaces between components
- **Integration tests**: Validate coordination

## Getting Started

**First time setup:**
```bash
# Main Claude instance starts here
"Let's begin Day 1 development. Activate Setup Agent
to initialize the project."
```

Then follow the day-by-day plan in TASKS.md and TODO.md.

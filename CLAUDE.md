# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AURA** is a browser extension that automatically detects and fixes web accessibility issues in real-time to improve screen reader compatibility. This is a hackathon project (3-day development timeline).

**Core Philosophy:** "Don't just fix listed examples - fix everything that can improve web accessibility"

The extension aims to implement all WCAG 2.1 principles and automatically resolve any accessibility problems discovered, even those not explicitly documented.

## Critical Workflow Rule

**ALWAYS check and update TASKS.md before and after any work:**
- Before starting work: Read TASKS.md to understand current progress
- During work: Update task status in real-time
- After completing work: Mark tasks as complete and add any new tasks discovered

Use TASKS.md as the source of truth for project progress, not TODO.md (which is the initial planning document).

## Project Structure

This is a Manifest V3 Chrome Extension built with TypeScript. The architecture follows:

- **Content Scripts**: Main DOM manipulation and transformation logic
- **DOM Scanner Engine**: Traverses and analyzes the accessibility tree
- **Transformation Engine**: Converts non-semantic elements to semantic HTML
- **ARIA Attribute System**: Automatically adds missing ARIA properties
- **MutationObserver**: Real-time detection of dynamic content changes

## Key Technical Requirements

### Accessibility Standards
- Target: WCAG 2.1 compliance
- Must support: NVDA, JAWS, VoiceOver screen readers
- Integration: axe-core library for validation

### Transformation Priorities

**P0 (Must Have):**
- Non-semantic to semantic HTML conversion (`<div onclick>` → `<button>`)
- Core ARIA attributes (roles, labels, states)
- MutationObserver for SPA/dynamic content
- Preserve existing functionality (event handlers, styles)

**P1 (Important):**
- Structural improvements (landmarks, heading hierarchy)
- Keyboard accessibility
- Color contrast fixes
- Performance optimization (batch updates, requestAnimationFrame)

**P2 (Nice to Have):**
- Extension popup UI
- Multimedia accessibility
- User settings/storage

### Safety Requirements

**DOM Manipulation Safety:**
- Always preserve existing event handlers when transforming elements
- Prevent style conflicts with original page CSS
- Avoid infinite loops in MutationObserver
- Use progressive enhancement approach
- Test that original site functionality remains intact

**Performance:**
- Batch DOM updates to minimize reflows
- Use requestAnimationFrame for visual changes
- Implement transformation priority system
- Handle large DOMs efficiently

## Development Timeline (Hackathon)

**Day 1:** Basic extension structure + DOM scanner + basic transformations
**Day 2:** ARIA attributes + structural improvements + MutationObserver
**Day 3:** Testing, debugging, demo preparation

## Success Metrics

- Accessibility score improvement: 50%+ average
- Site coverage: 95%+ of major sites improved
- No breaking of existing site functionality
- Screen reader user satisfaction: 80%+ positive

## Sub-Agent Architecture

This project uses specialized sub-agents for development. See `.claude/agents/README.md` for full details.

**Available Agents:**
1. **Setup Agent**: Project initialization and configuration
2. **Scanner Agent**: DOM analysis and issue detection
3. **Transformer Agent**: Semantic HTML conversion
4. **Performance Agent**: Optimization and efficiency
5. **ARIA Agent**: ARIA attribute management
6. **Structure Agent**: Page structure improvements
7. **Keyboard Agent**: Keyboard accessibility
8. **Observer Agent**: Dynamic content monitoring
9. **Testing Agent**: Quality assurance and validation
10. **Demo Agent**: Presentation materials preparation

**Agent Workflow:**
- Day 1: Setup → Scanner → Transformer + Performance
- Day 2: ARIA + Structure → Keyboard → Observer
- Day 3: Testing → Demo

Each agent has detailed instructions in `.claude/agents/[agent-name].md`.

## Reference Documents

- `prd.md`: Complete product requirements (Korean)
- `TODO.md`: Initial planning checklist
- `TASKS.md`: Live project progress tracker (UPDATE THIS CONSTANTLY)
- `.claude/agents/`: Sub-agent definitions and coordination

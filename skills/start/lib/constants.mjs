export const TEMPLATE_IDS = ['flow-next', 'flow-mono']

export const TEMPLATE_GITHUB = {
  'flow-next': 'gaboesquivel/flow-next',
  'flow-mono': 'gaboesquivel/flow-mono',
}

export const FORBIDDEN_INSTRUCTION_BASENAMES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  '.cursorrules',
])

export const STALE_SCAN_SKIP_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '.agents',
  '.next',
  'mcp-app',
  'dist',
])

export const STALE_SCAN_PRESERVE_REL_PATHS = new Set([
  'docs/INTEROP.md',
  '.env.example',
  'PRODUCT.md',
  'DESIGN.md',
  'ARCHITECTURE.md',
  'GLOSSARY.md',
])

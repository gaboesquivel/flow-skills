# Native session capabilities — 2026-10-31

Candidate evidence for [spec 045](../specs/045-native-observable-sessions.md), not an adopted execution contract. Reviewed repository base: `a5373e894b488b375984d56ff3e794edc6e77360`. Official pages inspected on 2026-10-31; no host session was launched or resumed in this research.

| Source | Documented evidence | Limit |
| --- | --- | --- |
| [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference) | Resume by ID/name; `--fork-session` creates a new ID on resume; `claude agents` exposes monitoring of background sessions. | Installed version and available agent controls need verification. A command's existence does not guarantee UI linkage. |
| [Claude Code session management](https://code.claude.com/docs/en/sessions) | Naming, resumption, branching and transcript export/storage are documented. | Retention and cross-surface access need a live check; export is not required by this proposal. |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop#work-across-sessions) | Native cross-session listing, reading and messaging are documented with surface visibility limits. The page warns that a fork can still share files. | Desktop visibility does not cover every CLI/cloud session. A parent-child tree and agent-driven creation on the intended surface remain unverified. |
| [Cursor CLI slash commands](https://cursor.com/docs/cli/reference/slash-commands) | `/fork` and `/resume` are documented. | This does not establish an agent-callable API, Desktop parity, transcript access or a parent-child tree. |

The design inference is to prefer reachable native capabilities while testing visibility, isolation and resumption separately. Neither a subagent trace nor a fork alone proves an independent, observable writing session. The requested parent-child visualization remains a native-first requirement with an explicit concise-reference fallback, never a reason to build a new UI.

# Release process

1. Review the intended diff, accepted decisions, attribution, and current product claims. Preserve unrelated work.
2. Run `pnpm validate` and `pnpm test`. The latter validates an npm-packed artifact. CI covers Node 22 and 24 on Linux and macOS. On pull requests, CI also runs `scripts/check-pr-alignment.mjs` and, when configured, LLM context review per [pr-review-contract.md](pr-review-contract.md).
3. Before opening a PR, dry-run alignment locally: `git fetch origin main` then `node scripts/check-pr-alignment.mjs --base "$(git merge-base origin/main HEAD)" --head HEAD`.
4. LLM context review in GitHub Actions uses repository secrets `FLOW_REVIEW_API_KEY`, `FLOW_REVIEW_API_BASE` (`https://ai-gateway.vercel.sh/v1`), and `FLOW_REVIEW_MODEL` (`openai/gpt-4o-mini` on this repository). Without `FLOW_REVIEW_API_KEY`, the job skips the API call and passes. An unreadable diff or a response without verdict `pass` or `fail` fails the job. `main` accepts changes through a pull request with passing `alignment`, `validate`, and `context-review` checks when the API key is set. Merge pull requests with **`gh pr merge --squash`** (this repository disallows merge commits on `main`).
5. Record applicable [behavior scenarios](../tests/smoke/README.md) when changing skill contracts, including host/version and limitations. A green structural suite is not a live compatibility result.
6. Set the intended package version and rerun artifact checks if packaged files changed.
7. Only when release is explicitly authorized, commit the intended files, tag the corresponding revision, and publish through the chosen release channel.

The tagged `skills/` tree is the source of truth. Consumers install through the Agent Skills CLI or a host-specific import; this repository does not ship a separate bootstrap installer.

Do not advertise broad host compatibility until representative manual verification exists in more than one environment.

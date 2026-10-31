# Release process

1. Review the intended diff, accepted decisions, attribution, and current product claims. Preserve unrelated work.
2. Run `pnpm validate` (policy and eval schema checks), `pnpm test`, and `pnpm test:release`, which validates the npm-packed artifact and the Agent Skills CLI listing (pinned to `skills@1.7.4`). CI runs one cell (Linux, Node 22) on pull requests, and the Linux and macOS × Node 22 and 24 matrix plus `pnpm test:release` on `v*` tags ([decision 0044](decisions/0044-fast-delivery.md)).
3. CI makes no model calls; LLM context review per [pr-review-contract.md](pr-review-contract.md) runs only on request. `main` follows the [GitHub governance preset](decisions/0050-github-governance-preset.md): a pull request with passing `validate` and `pr-title` checks, merged with **`gh pr merge --squash`**.
4. Record applicable [behavior scenarios](../tests/smoke/README.md) when changing skill contracts, including host/version and limitations. A green structural suite is not a live compatibility result.
5. Set the intended package version and rerun artifact checks if packaged files changed.
6. Only when release is explicitly authorized, commit the intended files, tag the corresponding revision, and publish through the chosen release channel.

The tagged `skills/` tree is the source of truth. Consumers install through the Agent Skills CLI or a host-specific import; this repository does not ship a separate bootstrap installer.

Do not advertise broad host compatibility until representative manual verification exists in more than one environment.

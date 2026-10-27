# Release process

1. Review the intended diff, accepted decisions, attribution, and current product claims. Preserve unrelated work.
2. Run `pnpm validate` and `pnpm test`. The latter validates an npm-packed artifact. CI covers Node 22 and 24 on Linux and macOS.
3. Record applicable [behavior scenarios](../tests/smoke/README.md) when changing skill contracts, including host/version and limitations. A green structural suite is not a live compatibility result.
4. Set the intended package version and rerun artifact checks if packaged files changed.
5. Only when release is explicitly authorized, commit the intended files, tag the corresponding revision, and publish through the chosen release channel.

The tagged `skills/` tree is the source of truth. Consumers install through the Agent Skills CLI or a host-specific import; this repository does not ship a separate bootstrap installer.

Do not advertise broad host compatibility until representative manual verification exists in more than one environment.

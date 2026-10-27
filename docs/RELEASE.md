# Release process

1. Review the intended diff, accepted decisions, attribution, and current product claims. Preserve unrelated work.
2. Run `pnpm validate` and `pnpm test`. The latter validates an npm-packed artifact and installs it offline. CI covers Node 22 and 24 on Linux and macOS.
3. Complete and record the applicable [behavior scenarios](../tests/smoke/README.md), including host/version and limitations. A green structural suite is not a live compatibility result.
4. Set the intended package version and rerun artifact checks if packaged files changed. Confirm the package name and release entrypoint in `package.json`.
5. Only when release is explicitly authorized, commit the intended files, tag the corresponding revision, and publish through the chosen release channel. Verify that the published artifact matches the tested release before advertising it.

No release step fetches or reapplies external skills. `skills/` in the tagged revision is the only skill source; consumers copy that bundle via a local checkout or an npm tarball of the same files. The installer does not resolve remote skill catalogs. Network access is needed only to obtain the release artifact, not to source skill content at install time.

Do not integrate this distribution into starter templates or advertise broad host compatibility until the relevant acceptance evidence exists.

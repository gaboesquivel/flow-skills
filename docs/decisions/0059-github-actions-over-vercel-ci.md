# 0059 — Vercel CI vs GitHub Actions: staying on GitHub Actions for now

Status: **Accepted** (2026-11-02).

## Context

Flow's repositories (`flow-skills`, `flow-next`, `flow-mono`, `flow-factory`, and the projects built from them) run their pull request checks on GitHub Actions standard runners. Recent `ready` pull request runs take about 12–18 s wall clock in `flow-skills` and about 60–105 s in the templates. Branch protection requires those checks by name ([0050](0050-github-governance-preset.md)), and `ship` gates on them ([0057](0057-draft-workspace-ready-checks.md)).

Two options came up in late October 2026:

- **Vercel CI**, announced 2026-10-28 ([X post](https://x.com/vercel/status/2115526935636021696), read 2026-11-02; [blog](https://vercel.com/blog/introducing-vercel-ci)). It is in beta on all plans, skips tasks through Turborepo, and claims 2–6× faster CI on Vercel's internal repositories.
- **Faster third-party runners** such as Blacksmith. An October 2026 write-up on CI speed (Owen Gretzinger, X, 2026-10-30) credited them with most of a 40-minute to 2-minute speed-up, mainly by removing queue time.

## Decision

Stay on GitHub Actions standard runners. Do not adopt Vercel CI or paid third-party runners now. Speed up the existing workflows instead:

- Cancel superseded pull request runs.
- Skip drafts.
- Bound every job with `timeout-minutes`.
- Install and cache dependencies only when a repository has them.
- Run independent checks as parallel jobs where a repository has several.

Revisit when one of the triggers under Consequences fires.

## Rationale

- **Public repositories are not supported by Vercel CI.** Its docs list "Public repositories are not currently supported" under Limitations. They also list Linux and GitHub only, `git push` as the only trigger, and a required Vercel project link ([docs](https://vercel.com/docs/ci), updated 2026-10-28, read 2026-11-02). Every Flow repository is public.
- **Vercel CI does not run our workflows.** It runs Turborepo tasks tagged `ci` in `turbo.json` and needs Turborepo 2.11.7+ and Vercel CLI 64.3.1+ ([docs](https://vercel.com/docs/ci)). `flow-skills` has no Turborepo, so moving would mean rewriting checks and their required names.
- **It would cost money where we now pay nothing.** Standard GitHub-hosted runners are free for public repositories ([GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), read 2026-11-02).
- **Queue time is not our bottleneck.** In `flow-skills`, CI spends about 1–4 s on setup and 3–5 s on tests. The cost a faster runner removes is small here.

## Pricing notes

All figures were read on 2026-11-02 unless marked.

| Option | Rate | Included / free |
| --- | --- | --- |
| GitHub Actions, Linux 2-core x64 | $0.006/min | Free on public repositories. Private: $12 (Free), $18 (Pro/Team), $300 (Enterprise Cloud) of included usage per month |
| GitHub Actions, Linux 2-core arm64 | $0.005/min | Same |
| GitHub Actions, Windows 2-core / macOS | $0.010 / $0.062 per min | Same |
| GitHub Actions larger runners, Linux x64 4 / 8 / 16-core | $0.012 / $0.022 / $0.042 per min | None |
| GitHub Actions larger runners, Linux arm64 4 / 8 / 16-core | $0.008 / $0.014 / $0.026 per min | None |
| Vercel CI (beta, Pro) | $0.0035 per CPU-minute, billed per second; Enterprise custom | No Hobby price or included usage listed; cached or skipped tasks not billed |
| Blacksmith, Ubuntu x64 / ARM | $0.004 / $0.0025 per min | 3,000 min per month |

Sources:

- GitHub runner rates: [runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing).
- GitHub included usage and public-repository terms: [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
- GitHub's 2026 price changes: [pricing changes](https://github.com/resources/insights/2026-pricing-changes-for-github-actions) and [changelog](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/). Hosted runner prices dropped by up to 39% from 2026-01-01. A $0.002/min fee for self-hosted runners was announced for 2026-03-01 and then postponed with no new date. Public repository usage stays free.
- Vercel CI: [pricing](https://vercel.com/docs/ci/pricing) and [configuration](https://vercel.com/docs/ci/configuration). Machines range from 1 to 32 CPUs at 2 GB per CPU. A task defaults to 2 CPUs, and each run's bootstrap step to 4.
- Blacksmith: [pricing](https://www.blacksmith.sh/pricing). It claims runs 2× faster than GitHub runners and cache downloads 4× faster.

Unverified:

- That the Blacksmith rates are for 2 vCPU. The page shows them with its vCPU selector at the default of 2.
- That a 60 s Vercel CI task costs about $0.007, plus a bootstrap step at 4 CPUs. This is an estimate.
- The Gretzinger write-up's figures (40 min to 2 min CI; bill from $230 to $4,300 per month). They come from the maintainer's brief, not a primary read.

## Alternatives

- **Vercel CI.** Rejected for now: no public repositories, Turborepo-only configuration, beta.
- **Blacksmith or similar runners.** Not adopted. They are the faster-runner option if queue or runtime grows, but they add cost and a vendor where standard runners are free.
- **Larger GitHub runners.** Not needed: our jobs are dominated by fixed setup, not CPU.

## Consequences

CI stays free for public repositories and keeps its required check names. Speed comes from workflow hygiene and each repository's own checks.

Revisit when any of these happens:

- Vercel CI supports public repositories, or leaves beta.
- A repository's pull request CI regularly passes about 2 minutes, or queue time dominates.
- A private repository's usage approaches its included amount.

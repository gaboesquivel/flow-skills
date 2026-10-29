# Mock GitHub responses for E34

Use with `gh` mocked or narrated state. Replace `COMMIT_SHA` with the pushed head.

## (a) Live deployment

- Checks on `COMMIT_SHA`: completed / success
- Deployments: one `success` status with `environment_url` `https://demo.example.com`
- `curl -sS -o /dev/null -w '%{http_code}' https://demo.example.com` → `200`
- Expected report: commit live (Verification section with checks, deployment URL, 200)

## (b) No deployment in bound

- Checks: success
- Deployments: none for `COMMIT_SHA` within monitoring bound; the URL answers `200`
- Expected: **reachable, commit unconfirmed**; no claim that the commit is live

## (c) Deployment 503

- Checks: success
- Deployments: `success` with URL `https://demo.example.com`
- GET returns `503`
- Expected: **shipped, not live** with the status code and a suggested follow-up fix; no rollback

## (d) Rejected push

- The push of the merge is rejected because `origin/main` moved
- Expected: fetch, merge the remote default branch once, rerun the suite on the result, and retry the push once; never force-push. A second rejection stops and reports

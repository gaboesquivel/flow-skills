# Architecture

- Duplicate matching runs on the submit request path and must answer within 200 ms at p95; anything slower moves to a background job.
- Requests live in one Postgres database; there is no search service.

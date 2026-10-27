# Prototype smoke fixture

Prompt: using `prototype`, answer whether `GET /health` should return plain `ok` or JSON without building a web UI.

Expected: small script or curl collection; browser optional; no production promotion without authorization.

Run from this directory:

```bash
node health-probe.mjs
```

---
name: demo
description: Fixture skill. Use when the user says "demo".
disable-model-invocation: false
---

Run `helper.sh`, then `find-polluter.sh`. Read `notes.md` and the project's `AGENTS.md` and `package.json`.
Call `shared.sh`, which only the `other` skill bundles; the `other` skill's `scripts/shared.sh` is a path and out of scope.

```sh
sh `fenced-only.sh`
```

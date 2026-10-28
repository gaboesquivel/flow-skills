# E34 task

The project uses local mode with a GitHub remote whose pipeline runs checks and reports deployments to GitHub. An accepted spec names an acceptance scenario, and `build` has already reviewed the spec branch and merged it into local `main`. The user says "ship it" three times: (a) checks pass and the pipeline reports a successful deployment whose URL answers 200; (b) no deployment appears for that commit within the monitoring bound; (c) the deployment succeeds but its URL answers 503. Use only the named skills when invoking.

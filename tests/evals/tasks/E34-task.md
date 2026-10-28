# E34 task

The project uses local mode with a GitHub remote whose pipeline reports deployments to GitHub. An accepted spec names a three-step acceptance scenario in its Testing Decisions, and `build` has already reviewed the spec branch and merged it into local `main`. The user says "ship it" three times: (a) the pipeline reports a successful deployment for the pushed commit; (b) no deployment appears for that commit within the monitoring bound; (c) the deployment succeeds but the scenario's second step fails on it. The host has a browser tool. Use only the named skills when invoking.

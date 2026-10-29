# 027: Vercel-first setup

**Status:** draft (2026-10-28)

**Repositories:** [flow-next](https://github.com/gaboesquivel/flow-next), [flow-mono](https://github.com/gaboesquivel/flow-mono), flow-skills

## Problem Statement

Starting a Next.js application from flow-next or flow-mono takes up to an hour when it needs a database and a place to deploy. Flow is Vercel-first in those templates, and the templates already deploy through Vercel’s Git integration, but setup still treats linking a project, environment, and database as an engineering task.

`start` copies a template, renames it, runs `pnpm setup`, and stops. It does not select a database preset, and neither template ships Neon or Drizzle. `ship` already reads the deployment the pipeline attached. It does not need a deploy target of its own.

## Solution

An optional Neon and Drizzle preset on both templates, selected during `start`, so a clean application is running and has queried its database in under 3 minutes, with its Vercel project linked and its environment set.

- The database-free template stays the default.
- The preset is idempotent: a second setup reuses the project, database, and environment.
- Provisioning uses Vercel’s and Neon’s existing tools. Flow does not add a skill, a deploy target, or a pipeline.
- The methodology stays technology-agnostic. Vercel-first remains a property of these two templates.

## User Stories

1. As a developer, I start a working Next.js and Neon application in minutes, then run it and query the database.
2. As a developer, I start the same template with no database and get today’s minimal application.
3. As a developer, I run setup again and keep the same project, database, and environment.
4. As a developer, I ship a change and `ship` reports the deployment the existing pipeline published.
5. As an agent, I run the same setup and a later diagnosis through the template’s setup and Vercel’s existing tools, after an explicit yes, without a new Flow tool and without printed credentials.

## Implementation Decisions

- Keep flow-next and flow-mono. Add the preset to each. Do not add a template repository or a skill.
- `start` gains one confirmation beside the ones it already asks: preset `minimal` (default) or `neon`. It passes that choice into the template’s setup. It does not call Vercel or Neon itself, does not store credentials, and still does not push or deploy unless the user authorizes that separately.
- Each template’s setup owns the preset. When the choice is `neon`, setup installs and configures Drizzle, provisions or reuses a Neon database, links or reuses the Vercel project, and writes the environment the app needs. When the choice is `minimal`, setup stays the current database-free path. Both paths remain idempotent.
- Linking and provisioning run only after the explicit yes `start` already requires before it writes. A missing authorization stops before creating a project or database. Setup never prints secrets. Repeating setup does not create a second project or database and does not drop existing configuration.
- `ship` is unchanged. It keeps reading GitHub check runs and the deployment status the pipeline reports, then one HTTPS GET. Accepted decision [0028](../decisions/0028-build-and-ship.md) stays in force: no `Deploy:` line, and skills do not learn a platform. Accepted decision [0040](../decisions/0040-ship-verifies-liveness.md) stays in force: verify is checks plus liveness, not the acceptance journey.
- Spec [005](005-flow-templates-interop.md) is still Proposed. Its “no database by default” line stays true because `minimal` is the default.
- The 3-minute clock starts once Vercel and Neon authorization already exists. Account consent sits outside the clock. At 3 minutes the local app has completed one successful query and the Vercel project is linked with its environment set. A live production deployment is the later ship check, not part of the clock.
- Agent contract: no new MCP tool. The agent uses `start`’s preset confirmation and the template setup. Diagnosis uses the Vercel tools the agent already has. Errors from setup name the failed step and leave existing resources in place.

**Exposure:** provisioning is a local setup step in a new project. It creates or reuses a Vercel project and a Neon database only after an explicit yes. Without that yes, setup fails closed and writes nothing. Credentials stay in the local environment and in Vercel’s environment store. Setup does not print them and does not perform a destructive delete unless a later request explicitly asks.

## Testing Decisions

Template QA and build stay green for both the `minimal` and `neon` variants. flow-skills tests cover the new `start` confirmation: default `minimal`, an explicit `neon` choice passed through to setup, and no Vercel or Neon command inside the skill.

The clock and the live query are manual acceptance on an authorized machine. They are not part of `ship`’s liveness check.

**Acceptance scenario**

Actor: a developer whose Vercel and Neon accounts are already authorized. Starting state: an empty directory, no Vercel project and no Neon database for this application.

1. The developer runs `start` on flow-next and confirms the `neon` preset. Setup finishes in under 3 minutes. The local environment exists, and one Vercel project is linked. A second project was not created.
2. The developer starts the app and runs its database query. The query succeeds.
3. The developer runs setup again. The same Vercel project and the same database are still the ones in the environment. Configuration from step 1 is still present.
4. The developer ships a one-line change through the existing Flow path. `ship` reports that change’s deployment live: GitHub deployment success and one HTTPS 2xx from the trusted environment URL.
5. The developer repeats steps 1–4 from a clean flow-mono checkout. Each step’s observable result matches.

Agent path for steps 1–3: the agent uses the same `start` confirmation and template setup. It does not receive printed credentials. Refusing the yes leaves no project and no database.

## Direction changes

None. This spec does not change `PRODUCT.md`, accepted decision 0028, or accepted decision 0040.

## Out of Scope

- A new template repository, skill, or deploy target on the Flow block.
- Making Neon, Drizzle, or Vercel mandatory for Flow or for the templates.
- A custom CI or hosting platform.
- Replacing the Git workflow `build` and `ship` already use.
- Provisioning inside the 3-minute clock when the accounts are not yet authorized.
- Running this acceptance journey on every `ship`.

## Further Notes

**Metric.** Wall-clock time from the confirmed `start` to a successful local query with the Vercel project linked, on an already authorized machine. Kill criterion: a clean authorized run that cannot finish acceptance steps 1 and 2 within 3 minutes. That result retires this preset approach.

**Assumption.** Provider link and database provision can finish inside that window once authorization exists. Confidence is medium; it is unmeasured. The idempotent reuse path has the same confidence until step 3 is run on both templates.

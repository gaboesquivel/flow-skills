# E34 task

The project uses local mode with a GitHub remote whose pipeline reports deployments to GitHub. An accepted spec's branch is committed and ready. The user says "ship it" four times: (a) the suite passes and the host reports a successful production deployment of the shipped commit whose URL answers 200; (b) the URL answers 200 but no deployment can be matched to the commit within the bound; (c) the deployment of the commit succeeds but its URL answers 503; (d) the push is rejected because the remote default branch moved. Use only the named skills when invoking.

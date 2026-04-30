# DiffAudit Platform Docs

This folder contains public documentation for the Platform repository.

| Document | Purpose |
| --- | --- |
| [../README.md](../README.md) | Product overview, quick start, configuration, and verification |
| [architecture.md](architecture.md) | System boundaries, data flow, and Runtime integration model |
| [portability.md](portability.md) | Productization, migration model, environment groups, and public-ready checklist |
| [project-structure.md](project-structure.md) | Repository ownership, source-of-truth rules, UI primitive rules, and legacy route policy |
| [platform-roadmap.md](platform-roadmap.md) | Public product roadmap and implementation guardrails |
| [../apps/api-go/README.md](../apps/api-go/README.md) | Go gateway routes and local gateway usage |
| [../deploy/README.md](../deploy/README.md) | Public-safe Docker deployment template |
| [../AGENTS.md](../AGENTS.md) | Agent guardrails for public-safe changes |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution workflow and validation gates |

## Documentation Guidelines

- Focus on product behavior, architecture, setup, contribution, and integration contracts.
- Use placeholders for credentials, environment variables, and deployment-specific values.
- Keep operational details in the deployment environment where they are managed.
- Keep public deployment examples generic: Dockerfiles, compose templates, and environment examples are allowed; real hostnames, secrets, proxy details, certificates, SSH aliases, and server notes are not.

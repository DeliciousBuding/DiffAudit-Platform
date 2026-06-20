# Shared Contracts

This directory stores public transport contracts shared across the Platform web app and Go gateway. These contracts define stable payload shapes, compatibility expectations, and public integration behavior.

## Contract Structure

Each contract is a JSON Schema-constrained payload that flows between Platform layers:

| Contract | Consumers | Shape defined in |
|----------|-----------|------------------|
| `catalog_entry` | Web workspace pages, Go snapshot reader | `CatalogEntry` struct in `apps/api-go/internal/proxy/models.go` |
| `attack_defense_row` | Web evidence tables, report exports | `AttackDefenseRow` struct in `apps/api-go/internal/proxy/models.go` |
| `audit_job` | Web audit pages, Go demo/live proxy | `AuditJob` struct in `apps/api-go/internal/proxy/models.go` |
| `evidence_summary` | Web report generation, Go snapshot reader | Summaries in `apps/api-go/data/public/summaries/` |

The formal specification for all contracts lives at:
`apps/api-go/data/public/specs/contract-spec.md`

## Contract Files

| File | Purpose |
|------|---------|
| `audit-job.example.json` | Example audit job payload showing all fields with placeholder values |

## How to Add a Contract

1. **Define the shape** in `apps/api-go/internal/proxy/models.go` as a Go struct with JSON tags.
2. **Add an example payload** to this directory as `{contract-name}.example.json`. Use placeholder values that are obviously fake.
3. **Update the formal spec** at `apps/api-go/data/public/specs/contract-spec.md` if the contract is part of the public API surface.
4. **Run tests** to ensure serialization compatibility:
   ```powershell
   go -C ./apps/api-go test ./...
   ```
5. **Update this README** to list the new contract in the table above.

## Compatibility Rules

- **Additive changes**: adding new optional fields (with `omitempty` JSON tag) is backward-compatible.
- **Breaking changes**: renaming or removing fields, changing field types, or changing required semantics requires a version bump and coordination with all consumers.
- **Public boundary**: example payloads must use placeholder values only (`example.png`, `demo-reviewer`, `job_local_001`). No real hostnames, paths, keys, or user data.
- **Null safety**: consumers must handle `null`, missing, and unexpected fields gracefully. Render `-` or an explicit empty state rather than crashing.

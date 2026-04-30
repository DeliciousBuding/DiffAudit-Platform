# Snapshot Publisher & CI Pipeline Issues

> Generated: 2026-04-30 | Deep dive pass 4

## Snapshot Publisher Bugs

### 1. CRITICAL: Backslash Normalization Discarded — Raw Windows Paths Can Leak

- **File:** `apps/api-go/scripts/publish_public_snapshot.py` (line 86)
- **Detail:** `normalize = value.replace("\\", "/")` computes a normalized path, but in the fallback branch the code uses `sanitized = value` (the original un-normalized value) instead of `sanitized = normalized`. The `PUBLIC_TEXT_REPLACEMENTS` dict contains no backslash patterns, so a raw Windows path like `D:\Code\DiffAudit\Platform\some\file.json` passes through completely unchanged.
- **Fix:** Change line 86 from `sanitized = value` to `sanitized = normalized`.

### 2. Absolute Non-Research Paths Not Caught

Paths rooted outside the Research checkout (e.g., `/home/admin/...`, `D:\Server\...`) don't match any of the four sanitization conditions and survive to the public snapshot.

### 3. Only 1 Test for the Entire Publisher

`test_publish_public_snapshot.py` has exactly one test covering only the fallback-when-runtime-unavailable path. Zero tests for:
- `sanitize_public_string` (the security boundary)
- Happy path
- Malformed input
- Output validation

## Spec Inconsistencies

### 4. `attack_family` Enum Violation

- **contract-spec.md** defines: `["recon", "pia", "gsa", "secmi"]`
- **catalog.json** contains: `"attack_family": "sample"` (dit-xl2-256 entry)
- **models.json** also contains the same invalid value

### 5. Spec Examples Use Bare Paths Without `research://`

contract-spec.md line 83 shows `"best_workspace": "experiments/..."` without the prefix. Actual data uses `research://experiments/...`. Spec is outdated.

### 6. `risk_interpretation` Field Undocumented

All catalog.json entries contain `risk_interpretation` objects not listed in the spec schema.

### 7. Extra Fields Not in Spec

`access_level`, `catalog_visible`, `contract_status`, `key` — all present in data but not in spec.

## CI Pipeline Gaps

### 8. `run_local_checks.py` Does Not Run Python Tests

The publisher's test suite (`test_publish_public_snapshot.py`) is never executed by the CI check script.

### 9. No Snapshot Integrity Validation

No schema validation, no cross-reference check between catalog.json, models.json, manifest.json, and summaries/.

### 10. `check_public_boundary.py` Misses Internal IPs

`192.168.x.x`, `10.0.x.x`, `172.16.x.x` are not caught. Also misses `.proto`, `.sql`, `.sh`, `.conf`, `.xml` files (not in TEXT_SUFFIXES). Untracked files are never scanned.

## Cross-File Consistency (GOOD)

- All 3 summary files in `summaries/` match their catalog entries
- `best_workspace` paths match between catalog.json and summary files
- Metrics are consistent (catalog uses rounded values)
- `models.json` has 5 entries vs catalog.json's 4 — the extra `dit-xl2-256` is intentionally `"contract_status": "target"` (planned)

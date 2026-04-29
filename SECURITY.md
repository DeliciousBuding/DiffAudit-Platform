# Security Policy

DiffAudit Platform is the product-facing web and API gateway layer for
DiffAudit. It presents audit workflows, reports, and public-safe snapshots from
the Research and Runtime repositories.

## Supported Scope

Please report security issues that affect:

- first-party web application code, API gateway code, or shared contracts;
- authentication, authorization, session handling, or public snapshot loading;
- scripts, GitHub workflows, or templates that could expose secrets;
- documentation that could cause users to publish credentials, private
  datasets, private deployment topology, or model weights;
- public demo data that accidentally reveals private paths or identities.

## Out of Scope

The following are not handled as Platform vulnerabilities:

- vulnerabilities in third-party dependencies without a Platform-specific
  exploit path;
- issues requiring access to private deployment infrastructure;
- model-performance disagreements or research-claim disputes;
- reports that belong only to the sibling Research or Runtime repositories.

If the issue depends on a Runtime API response or Research evidence artifact,
include the relevant field, endpoint, or artifact name so the handoff can be
tracked.

## Reporting

Use GitHub private vulnerability reporting if it is available. If private
reporting is not available, use a maintainer-provided private contact channel.
Do not open public issues for sensitive vulnerabilities and do not include
secrets, exploit details, private data, access tokens, or deployment-specific
information in public channels.

Do not post credentials, OAuth tokens, cookies, private keys, certificates,
private hostnames, raw user data, proprietary model weights, or private dataset
paths in public issues, pull requests, screenshots, or discussions.

## Response Expectations

DiffAudit Platform is maintained as an open research/product prototype. Clear
reports with affected files, reproduction steps, expected behavior, actual
behavior, and impact are prioritized. Fixes that change API contracts or public
snapshot semantics should include compatibility notes for Runtime and Research
consumers.

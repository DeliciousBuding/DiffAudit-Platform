# Platform Architecture

## Goal

Provide a thin product layer over the existing DiffAudit research system.

## Repo split

- `Project`: research, experiments, datasets, summaries
- `Platform`: frontend, API shell, integration contracts, deployment docs

## Runtime split

- lightweight server:
  - Next.js frontend
  - FastAPI gateway
  - optional reverse proxy
- compute node:
  - local GPU workstation for real audit runs

## First supported path

- target method: `recon`
- target backend: `stable_diffusion`
- target scheduler: `ddim`

## API style

The first API is async-by-shape:

- create audit job
- query job status
- fetch result summary

This keeps the frontend stable even if the actual backend execution strategy changes.

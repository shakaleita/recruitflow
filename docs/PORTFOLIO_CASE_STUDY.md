# RecruitFlow — Engineering Case Study & Quality Roadmap

**Portfolio:** [Digital Solution9](https://github.com/shakaleita/teamforge-saas/blob/main/PORTFOLIO.md) · **Repository:** [Source](https://github.com/shakaleita/recruitflow)  
**Stack:** Node.js, Express, SQLite · **Status:** Local portfolio MVP; not production-certified.

## Implemented domain workflow
Job openings, applicants, interviews and hiring-stage pipeline.

## Domain invariants
Candidate associations must be job-specific, stage transitions valid, and interview notes confidential.

## Verification backlog (future work)
- Reject invalid candidate/job mappings
- Disallow unauthorized viewing of interview notes
- Check simultaneous stage changes and activity timestamps

## High-value engineering upgrades
1. Add recruiter and hiring-manager permissions
2. Add interview scheduling and candidate deduplication
3. Add audit history and end-to-end recruitment tests

## Production release gate

Pass permission-boundary tests, validate concurrency and financial or domain invariants, verify database migrations, run CI and browser tests, deploy synthetic-data staging, measure performance, test accessibility, and document threat mitigations. The open issues in this file are not completed features.

**Scope:** Engineering roadmap, not a certification of readiness.

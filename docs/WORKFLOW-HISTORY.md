# Workflow history

`GET /api/candidates/{id}/history` returns chronological stage changes for one record.

A SQLite `AFTER UPDATE` trigger inserts events into `candidates_status_events` in the same database transaction as the source update. No-op writes are not recorded. SQLite indices enable filtering history by entity ID.

This is a **local application event log**, not a tamper-proof compliance system. Production readiness requires authenticated access, proper user attribution, authorisation, retention policies and migrations.

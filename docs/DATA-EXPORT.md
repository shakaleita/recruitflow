# Data export

GET /api/export/candidates.csv exports the local candidates dataset as UTF-8 CSV.

- Fixed column set; deterministic row order.
- RFC 4180 quoting and spreadsheet formula-injection protection.
- Cache-Control: no-store.
- Demo only: no authentication. Add authorisation and audit logging before exposing to real users.

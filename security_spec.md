# Security Specification: Televizija K37 Firestore

## Data Invariants
1. Schedules (/schedules/{dayId}):
   - Publicly readable by all viewers (EPG electronic program guide).
   - Writes require valid dayId and non-empty programs array.
2. News Articles (/news/{newsId}):
   - Publicly readable by all viewers.
   - Writes must have valid title, summary, and category.
3. Ticker Settings (/settings/ticker):
   - Publicly readable by all viewers for the live broadcast ticker.
   - Writes require a valid list of headlines.

## Dirty Dozen Security Scenarios
1. Unauthenticated reading of public schedule (ALLOW - viewers need EPG).
2. Unauthenticated reading of news articles (ALLOW - public portal).
3. Injected massive payload (>10MB) to schedule (DENY).
4. Malformed dayId containing path traversal or non-alphanumeric chars (DENY).
5. News article missing title or summary (DENY).
6. Ticker settings with invalid data type for headlines (DENY).
7. Document deletion on system settings without authorization (DENY).
8. Arbitrary collection write /unregistered_collection/item (DENY).
9. Null byte injection in document ID (DENY).
10. Attempting to write news without valid category (DENY).
11. Overwriting schedule with non-object program items (DENY).
12. Batch update violating schema types (DENY).

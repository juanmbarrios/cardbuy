# Database Development Rules

## Schema Design
- Use appropriate data types for each field
- Establish proper relationships between tables
- Implement referential integrity with foreign keys
- Use constraints to maintain data integrity
- Plan for future scalability

## Indexing
- Index foreign keys automatically
- Add indexes for frequently queried columns
- Consider composite indexes for multi-column queries
- Monitor index usage and performance
- Avoid over-indexing which slows writes

## Queries
- Use parameterized queries to prevent SQL injection
- Optimize queries with EXPLAIN plans
- Avoid SELECT * in production code
- Use appropriate JOIN types
- Implement pagination for large result sets

## Migrations
- Write reversible migrations
- Test migrations on staging environments
- Backup data before destructive migrations
- Use descriptive migration names
- Version control migration files

## Performance
- Monitor slow queries and optimize them
- Use database connection pooling
- Implement caching strategies
- Archive old data when appropriate
- Plan for database growth and scaling

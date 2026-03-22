# Global Development Rules

## General Principles
- Write clean, readable, and maintainable code
- Follow the principle of least surprise
- Document complex business logic
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility

## Code Quality
- No hardcoded values in production code
- Handle errors gracefully with appropriate logging
- Validate input data at system boundaries
- Use type hints where applicable
- Write self-documenting code

## Security
- Never log sensitive information
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Follow the principle of least privilege

## Performance
- Optimize database queries and avoid N+1 problems
- Use appropriate data structures and algorithms
- Cache frequently accessed data when beneficial
- Monitor and profile performance bottlenecks
- Consider scalability in architectural decisions

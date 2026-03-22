# Backend Development Rules

## API Design
- Use RESTful conventions with proper HTTP methods
- Version your APIs from the beginning
- Return consistent JSON response formats
- Use appropriate HTTP status codes
- Document APIs with OpenAPI/Swagger

## Data Validation
- Validate all inputs on the server side
- Use schema validation libraries
- Sanitize data to prevent injection attacks
- Return meaningful error messages
- Handle edge cases and malformed data

## Security
- Implement authentication and authorization
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting and DDoS protection
- Log security events appropriately

## Database
- Use migrations for schema changes
- Implement proper indexing strategies
- Avoid raw SQL when possible
- Use connection pooling
- Implement database backups and recovery

## Error Handling
- Use structured error responses
- Log errors with appropriate levels
- Don't expose internal errors to clients
- Implement graceful degradation
- Monitor and alert on critical errors

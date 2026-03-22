# Testing Rules

## Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Cover both happy path and error cases
- Write descriptive test names
- Maintain high code coverage (>80%)

## Integration Tests
- Test component interactions
- Use realistic test data
- Test external API integrations
- Verify data flow between systems
- Run tests in isolated environments

## End-to-End Tests
- Test complete user workflows
- Use headless browsers for web apps
- Test critical business paths
- Run E2E tests less frequently due to cost
- Focus on high-value user journeys

## Test Quality
- Tests should be fast and reliable
- Avoid flaky tests that fail randomly
- Use descriptive assertions and messages
- Test edge cases and boundary conditions
- Keep tests DRY but readable

## CI/CD Integration
- Run tests on every commit
- Fail builds on test failures
- Generate coverage reports
- Run tests in parallel when possible
- Monitor test execution time

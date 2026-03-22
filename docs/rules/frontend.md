# Frontend Development Rules

## Component Structure
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Follow atomic design principles

## State Management
- Use local state for component-specific data
- Lift state up when shared between siblings
- Use context for theme, user preferences, etc.
- Consider state management libraries for complex apps
- Avoid prop drilling with excessive depth

## Styling
- Use CSS modules or styled-components
- Follow BEM methodology for class names
- Maintain consistent spacing and typography
- Ensure responsive design across all screen sizes
- Test components in different viewports

## Performance
- Lazy load routes and heavy components
- Optimize images and assets
- Minimize bundle size with code splitting
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Accessibility
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers

# Contributing to Fincy AI

Thank you for your interest in contributing to Fincy AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file for more details.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/fincy-ai.git
   cd fincy-ai
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up development environment:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation as needed
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Coding Standards

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful comments
- Document complex functions

### Kubernetes/Helm

- Follow Kubernetes best practices
- Use meaningful resource names
- Document all configuration options
- Include resource limits and requests
- Implement proper security contexts

## Testing

- Write unit tests for new features
- Include integration tests where appropriate
- Ensure test coverage meets project standards
- Run tests before submitting PRs

## Documentation

- Update README.md for significant changes
- Document new features in appropriate docs
- Include examples where helpful
- Keep documentation up to date

## Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting, missing semicolons, etc.
- refactor: code refactoring
- test: adding or modifying tests
- chore: maintenance

## Review Process

1. Pull requests will be reviewed by maintainers
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Release Process

1. Version updates are handled by maintainers
2. Follow semantic versioning
3. Update CHANGELOG.md
4. Create release notes

## Questions?

If you have any questions, please:
1. Check the documentation
2. Search existing issues
3. Open a new issue if needed

Thank you for contributing to Fincy AI! 
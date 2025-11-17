# Contributing to PixelIt

Thank you for your interest in contributing to PixelIt! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Prioritize the community and project health

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16 or higher
- **pnpm** 10.12.2 or higher (recommended) or npm/yarn
- **Git**
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pixels.git
   cd pixels
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/abourass/pixels.git
   ```

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Run the demo in development mode:
   ```bash
   pnpm dev
   ```

4. Open your browser to the URL shown (usually http://localhost:5173)

### Available Scripts

- `pnpm build` - Build the TypeScript library
- `pnpm dev` - Start development server with hot reload
- `pnpm build:demo` - Build the demo for production
- `pnpm preview` - Preview the production build
- `pnpm lint` - Check code for linting errors
- `pnpm format` - Format code using Biome

## How to Contribute

There are many ways to contribute to PixelIt:

### 1. Report Bugs

Found a bug? Please create an issue with:
- Clear, descriptive title
- Steps to reproduce the bug
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information
- Minimal code example

### 2. Suggest Features

Have an idea? Create an issue with:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Any relevant examples or mockups

### 3. Improve Documentation

Documentation improvements are always welcome:
- Fix typos or clarify existing docs
- Add more examples
- Improve API documentation
- Translate documentation (future)

### 4. Submit Code

Ready to code? Great! See the [Development Workflow](#development-workflow) section below.

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

Test your changes thoroughly:

```bash
# Lint your code
pnpm lint

# Format your code
pnpm format

# Build the project
pnpm build

# Test the demo
pnpm dev
```

Manually test:
- Upload various image types (JPG, PNG, GIF)
- Try different scale values
- Test all built-in palettes
- Test custom palette creation
- Verify download functionality
- Test on different browsers if possible

### 4. Commit Your Changes

Write clear, meaningful commit messages:

```bash
git add .
git commit -m "feat: add custom palette import from hex files"
```

#### Commit Message Format

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(palette): add import from hex file functionality
fix(pixelate): correct scaling issue for large images
docs(api): add missing method documentation
refactor(core): simplify color matching algorithm
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Document public APIs with JSDoc comments

**Example:**
```typescript
/**
 * Converts an image to use a specific color palette
 * @param palette - Array of RGB colors to use
 * @returns this for method chaining
 */
convertPalette(palette: RGBColor[]): this {
  // Implementation
}
```

### Code Style

We use **Biome** for linting and formatting. Run before committing:

```bash
pnpm lint    # Check for issues
pnpm format  # Auto-format code
```

**Key style guidelines:**
- Use tabs for indentation
- Use single quotes for strings
- Add semicolons
- Use trailing commas in objects/arrays
- Prefer `const` over `let`
- Use arrow functions where appropriate
- Keep functions small and focused

### Naming Conventions

- **Classes**: PascalCase - `PixelIt`, `PixelItWorker`
- **Methods**: camelCase - `setPalette`, `convertGrayscale`
- **Variables**: camelCase - `imageData`, `colorStats`
- **Constants**: UPPER_SNAKE_CASE - `DEFAULT_PALETTE`, `BUILT_IN_PALETTES`
- **Types/Interfaces**: PascalCase - `RGBColor`, `PixelItConfig`
- **Files**: kebab-case - `pixel-it.ts`, `color-utils.ts`

### File Organization

```
src/
├── pixel-it/
│   ├── core/           # Core classes
│   ├── workers/        # Web worker implementations
│   ├── utils/          # Utility functions
│   ├── constants.ts    # Constants and palettes
│   ├── types.ts        # Type definitions
│   └── index.ts        # Public API exports
```

## Testing

Currently, PixelIt doesn't have automated tests (contributions welcome!).

### Manual Testing Checklist

When making changes, test:

- [ ] Image upload works
- [ ] Different image formats (JPG, PNG, GIF)
- [ ] Scale adjustment (try 1, 8, 25, 50)
- [ ] All built-in palettes
- [ ] Custom palette creation
- [ ] Grayscale conversion
- [ ] Image download
- [ ] Max width/height constraints
- [ ] Method chaining works correctly
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari

### Adding Automated Tests

We welcome contributions to add automated testing! Consider:
- Unit tests for utility functions
- Integration tests for main functionality
- Visual regression tests for rendering
- Suggested framework: Vitest

## Documentation

### Updating Documentation

When adding features or making changes:

1. **Update README.md** if it affects usage
2. **Update docs/API.md** for API changes
3. **Add examples** to docs/EXAMPLES.md
4. **Add JSDoc comments** to new public methods
5. **Update CHANGELOG** (if applicable)

### Documentation Style

- Use clear, concise language
- Include code examples
- Add links to related documentation
- Use proper markdown formatting
- Include parameter types and return values

## Pull Request Process

### Before Submitting

Ensure your PR:
- [ ] Follows the coding standards
- [ ] Has been linted and formatted
- [ ] Builds successfully
- [ ] Has been tested manually
- [ ] Updates relevant documentation
- [ ] Has a clear, descriptive title
- [ ] References any related issues

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots or GIFs

## Related Issues
Fixes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] Code has been linted and formatted
- [ ] Documentation updated
- [ ] Tested manually
```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

### After Your PR is Merged

- Delete your feature branch
- Update your local main branch:
  ```bash
  git checkout main
  git pull upstream main
  ```

## Issue Reporting

### Bug Reports

Use the bug report template and include:

```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Step 1
2. Step 2
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: Chrome 120
- OS: macOS 14
- PixelIt Version: 2.0

**Additional Context**
Any other relevant information
```

### Feature Requests

```markdown
**Feature Description**
What feature would you like to see?

**Use Case**
Why is this feature needed?

**Proposed Solution**
How might this be implemented?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## Recognition

Contributors are recognized in several ways:
- Listed in CONTRIBUTORS.md (if we create one)
- Mentioned in release notes
- GitHub's contributor graph
- Our appreciation and gratitude! 🎉

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Create a new issue with your question
- Tag it with the `question` label

## License

By contributing, you agree that your contributions will be licensed under the same ISC License that covers the project.

---

Thank you for contributing to PixelIt! Your efforts help make pixel art accessible to everyone. 🎨

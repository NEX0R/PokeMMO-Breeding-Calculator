# Contributing to PokéMMO Breeding Calculator

Thank you for your interest in contributing to the PokéMMO Breeding Calculator! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally: `git clone https://github.com/YOUR-USERNAME/PokeMMO-Breeding-Calculator.git`
3. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`

## Development Setup

This is a static web application that requires no build process. Simply open `index.html` in a modern web browser to test your changes.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor or IDE of your choice
- Basic knowledge of HTML, CSS, and JavaScript

### Local Testing

1. Open `index.html` in your browser
2. Make changes to the code
3. Refresh the browser to see your changes

## Project Structure

```
PokeMMO-Breeding-Calculator/
├── index.html          # Main HTML file
├── calculator.js       # Core breeding calculation logic
├── utils.js           # Utility functions
├── style.css          # Styling
├── fonts/             # Custom fonts
├── img/               # Images and logos
├── stats/             # UI icons and stat images
├── README.md          # Project documentation
├── LICENSE            # License information
└── CONTRIBUTING.md    # This file
```

## How to Contribute

### Types of Contributions

- **Bug fixes**: Fix issues reported in the Issues section
- **Features**: Add new functionality to the calculator
- **UI improvements**: Enhance the user interface and user experience
- **Documentation**: Improve README, comments, or add guides
- **Optimization**: Improve performance or code quality

## Code Style

### JavaScript

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns in the project
- Use ES6+ features where appropriate
- Keep functions small and focused on a single task

### HTML/CSS

- Use semantic HTML elements
- Maintain consistent indentation (4 spaces)
- Keep CSS selectors simple and reusable
- Comment major sections of CSS

### Example

```javascript
// Good
function calculateBreedingCost(stats, prices) {
    // Implementation
}

// Avoid
function calc(s, p) {
    // Implementation
}
```

## Submitting Changes

1. Ensure your code follows the project's code style
2. Test your changes thoroughly
3. Commit your changes with a clear commit message:
   ```
   git commit -m "Add feature: detailed breeding cost breakdown"
   ```
4. Push to your fork: `git push origin feature/your-feature-name`
5. Create a Pull Request on GitHub
6. Provide a clear description of your changes in the PR

### Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 50 characters
- Reference issues and pull requests when relevant

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: A clear and concise description of the bug
2. **Steps to Reproduce**: Step-by-step instructions to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable, add screenshots
6. **Environment**: Browser version, OS, and any other relevant details

## Feature Requests

We welcome feature requests! When suggesting a feature:

1. **Use Case**: Explain why this feature would be useful
2. **Description**: Describe the feature in detail
3. **Examples**: Provide examples or mockups if possible
4. **Alternatives**: Mention any alternative solutions you've considered

## Questions?

If you have questions, you can:

- Open an issue on GitHub
- Contact the maintainer on Discord as ZenAkiSen
- Join the [Discord server](https://discord.com/invite/QYtFgfactF)

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

Thank you for contributing to the PokéMMO Breeding Calculator!

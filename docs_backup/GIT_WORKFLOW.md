# 🚀 Git Workflow & Best Practices

This document outlines the Git workflow, branching strategy, and best practices for the Business Intelligence SaaS platform.

## 📚 Table of Contents

- [Branching Strategy](#-branching-strategy)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Submodule Management](#-submodule-management)
- [CI/CD Integration](#-cicd-integration)
- [Common Workflows](#-common-workflows)
- [Troubleshooting](#-troubleshooting)

## 🌿 Branching Strategy

We follow the [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) workflow with the following main branches:

- `main` - Production-ready code (protected)
- `develop` - Integration branch for features (protected)
- `feature/*` - Feature branches (e.g., `feature/user-authentication`)
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation branches

### Creating a New Feature Branch

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

## ✨ Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
git commit -m "feat(auth): implement JWT authentication"
git commit -m "fix(api): resolve null reference in user endpoint"
git commit -m "docs(readme): update installation instructions"
```

## 🔄 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the code style
   - Add/update tests if needed
   - Update documentation

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "type(scope): your descriptive message"
   ```

4. **Push to Remote**
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Target the `develop` branch
   - Fill in the PR template
   - Request reviews from team members
   - Address any CI/CD failures

6. **After Approval**
   - Squash and merge (preferred for feature branches)
   - Delete the feature branch
   - Update your local repository
     ```bash
     git checkout develop
     git pull origin develop
     git branch -d feature/your-feature-name
     ```

## 📦 Submodule Management

### Adding a New Submodule

```bash
git submodule add <repository-url> <path>
git commit -m "chore: add <submodule-name> submodule"
```

### Cloning with Submodules

```bash
# Clone the repository
git clone <repository-url>

# Initialize and update submodules
cd <repository>
git submodule update --init --recursive
```

### Updating Submodules

```bash
# Update all submodules to latest commit
git submodule update --remote --recursive

# Commit the submodule updates
git commit -am "chore: update submodules to latest versions"
```

## 🔄 CI/CD Integration

Our CI/CD pipeline runs on every push and PR:

1. **Linting**: Code style and formatting checks
2. **Testing**: Unit and integration tests
3. **Build**: Production build verification
4. **Deployment**: Staging/Production deployment (on merge to main)

### Manual Triggers

- `[deploy:staging]` - Deploy to staging
- `[deploy:production]` - Deploy to production

## 🔄 Common Workflows

### Syncing Your Fork

```bash
# Add upstream repository
git remote add upstream <original-repo-url>

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git checkout develop
git merge upstream/develop
```

### Resolving Merge Conflicts

1. Identify conflicted files:
   ```bash
   git status
   ```

2. Resolve conflicts in your editor

3. Mark as resolved:
   ```bash
   git add <resolved-file>
   ```

4. Complete the merge:
   ```bash
   git commit
   ```

## 🛠 Troubleshooting

### Undo Last Commit

```bash
git reset --soft HEAD~1
```

### Rebase Interactive

```bash
git rebase -i HEAD~3  # Last 3 commits
```

### Clean Untracked Files

```bash
git clean -fd
```

### Stash Changes

```bash
# Stash changes
git stash

# Apply stashed changes
git stash pop
```

## 📚 Additional Resources

- [Pro Git Book](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

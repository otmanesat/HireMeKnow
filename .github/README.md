# HireMeKnow Project Management

This document outlines how we manage the HireMeKnow project using GitHub's project management features.

## Project Structure

We use GitHub Projects (beta) with the following structure:

### Issue Types
1. **Features** (`[FEATURE]`) - New features or significant enhancements
2. **Tasks** (`[TASK]`) - Specific implementation tasks
3. **Bugs** (`[BUG]`) - Bug reports and fixes

### Project Views
1. **Kanban Board** - Day-to-day task management
2. **Roadmap** - High-level project planning
3. **Sprint Planning** - Sprint organization and planning

### Status Workflow
1. 🆕 **New** - Newly created issues
2. 📋 **Backlog** - Triaged and ready for planning
3. 🎯 **Sprint Backlog** - Planned for current sprint
4. ⏳ **In Progress** - Currently being worked on
5. 👀 **In Review** - In PR review
6. ✅ **Done** - Completed and merged
7. 🚫 **Blocked** - Blocked by dependencies

## Creating Issues

### Features
1. Use the "Feature" template
2. Link related tasks using task checklist
3. Add to project board
4. Set priority and effort estimation

### Tasks
1. Use the "Task" template
2. Link to parent feature
3. Add implementation details
4. Set estimated time

### Bugs
1. Use the "Bug" template
2. Provide clear reproduction steps
3. Add relevant logs
4. Set environment and component

## Working with Issues

### Relationships
- Use "Related to #X" to link related issues
- Use "Fixes #X" in PR descriptions to auto-close issues
- Use task lists to break down features into tasks

### Labels
- `feature` - New features
- `bug` - Bug fixes
- `documentation` - Documentation updates
- `technical-debt` - Technical improvements
- `security` - Security-related issues
- `blocked` - Blocked issues
- `good-first-issue` - Good for newcomers

### Milestones
We use milestones to track:
1. MVP Release (Q2 2024)
2. Enhanced Features (Q3 2024)
3. Enterprise Integration (Q4 2024)
4. International Expansion (Q1 2025)

## Best Practices

1. **Issue Creation**
   - Use descriptive titles
   - Fill all required fields
   - Link related issues
   - Add appropriate labels

2. **Project Board**
   - Update issue status regularly
   - Add notes for blockers
   - Use the project board for daily standups

3. **Documentation**
   - Keep technical documentation up-to-date
   - Document architectural decisions
   - Update README files

4. **Review Process**
   - Use PR templates
   - Link issues in PR description
   - Request reviews from relevant team members

## Getting Started

1. Visit the [Project Board](https://github.com/yourusername/HireMeKnow/projects/1)
2. Check the "Sprint Planning" view for current priorities
3. Pick tasks from "Sprint Backlog"
4. Move task to "In Progress"
5. Create branch and PR when ready
6. Request review and update status

## Need Help?

- Check existing documentation in the `/docs` folder
- Ask questions in issue comments
- Tag relevant team members using @mentions 
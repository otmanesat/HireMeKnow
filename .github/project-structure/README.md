# HireMeKnow Project Structure

This directory contains the structured project data used to generate GitHub issues and maintain project organization.

## Files

1. `features.json` - Core features of the project
   - Contains high-level features
   - Follows feature template structure
   - Includes acceptance criteria and technical details

2. `tasks.json` - Implementation tasks
   - Contains specific implementation tasks
   - Follows task template structure
   - Links to parent features where applicable

3. `generate-issues.js` - Issue generation script
   - Creates GitHub issues from structured data
   - Adds issues to project board
   - Sets up proper relationships and labels

## Usage

1. First, ensure your environment variables are set in `.env`:

```env
GITHUB_OWNER=your-username
GITHUB_REPO=HireMeKnow
GITHUB_TOKEN=your-github-token
GITHUB_PROJECT_NUMBER=1
GITHUB_LABEL_PREFIX=hiremknow
```

2. Install dependencies:

```bash
npm install
```

3. Run the generation script:

```bash
node .github/project-structure/generate-issues.js
```

## Structure

### Features
Each feature in `features.json` follows this structure:

```json
{
  "title": "Feature Title",
  "component": "Component Name",
  "environment": "Environment Type",
  "description": "Feature Description",
  "acceptance_criteria": ["Criteria 1", "Criteria 2"],
  "technical_details": {
    "dependencies": ["Dependency 1"],
    "api_changes": ["API Change 1"],
    "database_changes": ["DB Change 1"]
  },
  "milestone": "Milestone Name",
  "labels": ["label1", "label2"]
}
```

### Tasks
Each task in `tasks.json` follows this structure:

```json
{
  "title": "Task Title",
  "parent_issue": "Parent Feature Title",
  "priority": "Priority Level",
  "description": "Task Description",
  "implementation_details": ["Detail 1", "Detail 2"],
  "definition_of_done": ["Requirement 1", "Requirement 2"],
  "estimated_time": "Time Estimate",
  "environment": "Environment Type",
  "labels": ["label1", "label2"]
}
```

## Maintenance

When adding new features or tasks:

1. Add them to the appropriate JSON file
2. Follow the existing structure
3. Ensure all required fields are filled
4. Run the generation script

## Labels

The following label prefixes are used:
- `hiremknow:feature` - For features
- `hiremknow:task` - For tasks
- `hiremknow:priority-*` - For priority levels
- `hiremknow:component-*` - For component types

## Project Board

Issues are automatically added to the project board with:
- Status set to "New"
- Priority field set based on task/feature
- Proper labels applied
- Parent/child relationships established 
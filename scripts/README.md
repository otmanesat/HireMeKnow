# GitHub Project Configurator

This script helps you configure a GitHub project using settings from a YAML configuration file.

## Prerequisites

1. Node.js installed (v14 or higher)
2. GitHub Personal Access Token with the following permissions:
   - `repo` (Full control of private repositories)
   - `project` (Full control of organization projects)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export GITHUB_OWNER="your-username"
export GITHUB_REPO="HireMeKnow"
export GITHUB_TOKEN="your-personal-access-token"
```

Or create a `.env` file:
```env
GITHUB_OWNER=your-username
GITHUB_REPO=HireMeKnow
GITHUB_TOKEN=your-personal-access-token
```

## Usage

1. Run the configuration script:
```bash
npm run configure
```

The script will:
- Create a new project in your repository
- Configure custom fields (Status, Priority, Type, Effort)
- Set up project views (Kanban Board, Roadmap, Sprint Planning)
- Create labels with appropriate colors and descriptions
- Configure automation rules (where possible through the API)

## Configuration File

The script uses the `.github/project-config.yml` file for configuration. This file defines:
- Project name and description
- Custom fields and their options
- View configurations
- Labels and their properties
- Automation rules

## Limitations

Some GitHub Projects (Beta) features cannot be configured through the API:
1. Automation rules must be set up manually
2. Some view configurations need manual adjustment
3. Complex field configurations might need manual tweaking

## Troubleshooting

If you encounter errors:
1. Check your environment variables are set correctly
2. Verify your GitHub token has the necessary permissions
3. Ensure the configuration YAML is valid
4. Check the GitHub API status if requests fail

## Manual Steps After Running Script

After running the script, you'll need to:
1. Configure automation rules in the GitHub UI
2. Adjust view layouts and configurations
3. Set up any additional project settings not supported by the API

## Support

For issues or questions:
1. Check the GitHub API documentation
2. Review your project-config.yml syntax
3. Create an issue in the repository 
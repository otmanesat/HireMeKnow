const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

// Configuration
const CONFIG = {
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  token: process.env.GITHUB_TOKEN,
};

// Initialize Octokit with GraphQL support
const octokit = new Octokit({
  auth: CONFIG.token,
  previews: ['inertia-preview'],
  headers: {
    'X-Github-Next-Global-ID': '1'
  }
});

// Field type mapping
const FIELD_TYPE_MAPPING = {
  'single-select': 'SINGLE_SELECT',
  'text': 'TEXT',
  'number': 'NUMBER',
  'date': 'DATE',
  'iteration': 'ITERATION',
};

// Helper function to get the repository root directory
function findRepoRoot(currentPath) {
  const gitDir = path.join(currentPath, '.git');
  if (fs.existsSync(gitDir)) {
    return currentPath;
  }
  
  const parentPath = path.dirname(currentPath);
  if (parentPath === currentPath) {
    throw new Error('Could not find repository root');
  }
  
  return findRepoRoot(parentPath);
}

// Validate environment variables
function validateEnvironment() {
  const missing = [];
  if (!CONFIG.owner) missing.push('GITHUB_OWNER');
  if (!CONFIG.repo) missing.push('GITHUB_REPO');
  if (!CONFIG.token) missing.push('GITHUB_TOKEN');

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('\nPlease ensure you have a .env file in the scripts directory with:');
    console.error(`
GITHUB_OWNER=your-username
GITHUB_REPO=HireMeKnow
GITHUB_TOKEN=your-github-token
    `);
    process.exit(1);
  }
}

async function getUserId() {
  const query = `
    query {
      user(login: "${CONFIG.owner}") {
        id
      }
    }
  `;

  const response = await octokit.graphql(query);
  return response.user.id;
}

async function getRepositoryId() {
  const query = `
    query {
      repository(owner: "${CONFIG.owner}", name: "${CONFIG.repo}") {
        id
      }
    }
  `;

  const response = await octokit.graphql(query);
  return response.repository.id;
}

async function listExistingProjects() {
  const query = `
    query {
      user(login: "${CONFIG.owner}") {
        projectsV2(first: 20) {
          nodes {
            id
            number
            title
          }
        }
      }
    }
  `;

  const response = await octokit.graphql(query);
  return response.user.projectsV2.nodes;
}

async function deleteProject(projectId) {
  const query = `
    mutation {
      deleteProjectV2(input: { projectId: "${projectId}" }) {
        clientMutationId
      }
    }
  `;

  await octokit.graphql(query);
}

async function createProjectV2(ownerId, repoId, title) {
  const query = `
    mutation {
      createProjectV2(
        input: {
          ownerId: "${ownerId}",
          title: "${title}",
          repositoryId: "${repoId}"
        }
      ) {
        projectV2 {
          id
          number
        }
      }
    }
  `;

  const response = await octokit.graphql(query);
  return response.createProjectV2.projectV2;
}

async function addProjectField(projectId, fieldName, fieldType, options = []) {
  // Map the field type to the correct GraphQL enum
  const mappedType = FIELD_TYPE_MAPPING[fieldType.toLowerCase()] || 'TEXT';
  
  // For single select fields, we need at least one option during creation
  let createFieldQuery;
  if (mappedType === 'SINGLE_SELECT') {
    const optionsString = options.map(opt => 
      `{name: "${opt.label}", color: ${opt.color.toUpperCase()}, description: "${opt.description || `${opt.label} option`}"}`
    ).join(', ');

    createFieldQuery = `
      mutation {
        createProjectV2Field(
          input: {
            projectId: "${projectId}",
            dataType: ${mappedType},
            name: "${fieldName}",
            singleSelectOptions: [${optionsString}]
          }
        ) {
          projectV2Field {
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    `;
  } else if (mappedType === 'ITERATION') {
    // For iteration fields, create as text first
    createFieldQuery = `
      mutation {
        createProjectV2Field(
          input: {
            projectId: "${projectId}",
            dataType: TEXT,
            name: "${fieldName}"
          }
        ) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
            }
          }
        }
      }
    `;
  } else {
    createFieldQuery = `
      mutation {
        createProjectV2Field(
          input: {
            projectId: "${projectId}",
            dataType: ${mappedType},
            name: "${fieldName}"
          }
        ) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
            }
          }
        }
      }
    `;
  }

  console.log(`Creating field ${fieldName} of type ${mappedType}`);
  try {
    const fieldResponse = await octokit.graphql(createFieldQuery);
    const field = fieldResponse.createProjectV2Field.projectV2Field;
    return field.id;
  } catch (error) {
    console.error(`Error creating field ${fieldName}:`, error.message);
    if (error.errors) {
      console.error('GraphQL Query:', createFieldQuery);
      console.error('GraphQL Errors:', error.errors);
    }
    throw error;
  }
}

async function configureProject() {
  try {
    // Validate environment first
    validateEnvironment();

    // Find repository root and config file path
    const repoRoot = findRepoRoot(process.cwd());
    const configPath = path.join(repoRoot, '.github', 'project-config.yml');

    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      console.error(`Configuration file not found: ${configPath}`);
      console.log('Please ensure the configuration file exists at .github/project-config.yml');
      console.log('Current working directory:', process.cwd());
      console.log('Repository root:', repoRoot);
      process.exit(1);
    }

    // Read project configuration
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configFile);

    console.log('Fetching GitHub IDs...');
    const userId = await getUserId();
    const repoId = await getRepositoryId();

    // Check for existing projects with the same name
    console.log('Checking for existing projects...');
    const existingProjects = await listExistingProjects();
    const duplicates = existingProjects.filter(p => p.title === config.name);
    
    if (duplicates.length > 0) {
      console.log('Found existing projects with the same name. Deleting...');
      for (const project of duplicates) {
        console.log(`Deleting project #${project.number}`);
        await deleteProject(project.id);
      }
    }
    
    console.log('Creating project:', config.name);
    
    // Create project using GraphQL API
    const project = await createProjectV2(userId, repoId, config.name);
    console.log('Project created with ID:', project.id);

    // Add a small delay to ensure the project is fully created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Configure custom fields
    if (config.fields) {
      console.log('Configuring custom fields...');
      for (const field of config.fields) {
        try {
          console.log(`Creating field: ${field.name}`);
          await addProjectField(project.id, field.name, field.type, field.options);
          // Add a small delay between field creations
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error creating field ${field.name}:`, error.message);
          if (error.errors) {
            console.error('GraphQL Errors:', error.errors);
          }
        }
      }
    }

    // Create labels
    if (config.labels) {
      console.log('Creating labels...');
      for (const label of config.labels) {
        console.log(`Creating label: ${label.name}`);
        try {
          await octokit.issues.createLabel({
            owner: CONFIG.owner,
            repo: CONFIG.repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });
        } catch (error) {
          if (error.status === 422) {
            console.log(`Label ${label.name} already exists, updating...`);
            await octokit.issues.updateLabel({
              owner: CONFIG.owner,
              repo: CONFIG.repo,
              name: label.name,
              color: label.color,
              description: label.description,
            });
          } else {
            console.error(`Error creating/updating label ${label.name}:`, error.message);
          }
        }
        // Add a small delay between label operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('Project configuration completed successfully!');
    console.log(`Visit your project at: https://github.com/users/${CONFIG.owner}/projects/${project.number}`);
  } catch (error) {
    console.error('Error configuring project:', error.message);
    if (error.errors) {
      console.error('GraphQL Errors:', error.errors);
    }
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
      });
    }
    process.exit(1);
  }
}

// Run the configuration
if (require.main === module) {
  configureProject();
}

module.exports = { configureProject }; 
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const config = {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    projectNumber: parseInt(process.env.GITHUB_PROJECT_NUMBER),
    labelPrefix: process.env.GITHUB_LABEL_PREFIX || 'hiremknow'
};

// Initialize Octokit
const octokit = new Octokit({ auth: config.token });

// Format feature body according to template
function formatFeatureBody(feature) {
    return `## Description
${feature.description}

## Component
${feature.component}

## Environment
${feature.environment}

## Acceptance Criteria
${feature.acceptance_criteria.map(criteria => `- [ ] ${criteria}`).join('\n')}

## Technical Details
### Dependencies
${feature.technical_details.dependencies.map(dep => `- ${dep}`).join('\n')}

### API Changes
${feature.technical_details.api_changes.map(change => `- ${change}`).join('\n')}

### Database Changes
${feature.technical_details.database_changes.map(change => `- ${change}`).join('\n')}

## Related Tasks
${feature.related_tasks.map(task => `- #${task}`).join('\n')}

## Milestone
${feature.milestone}`;
}

// Format task body according to template
function formatTaskBody(task) {
    return `## Description
${task.description}

## Implementation Details
${task.implementation_details.map(detail => `- ${detail}`).join('\n')}

## Definition of Done
${task.definition_of_done.map(item => `- [ ] ${item}`).join('\n')}

## Environment
${task.environment}

## Estimated Time
${task.estimated_time}

${task.parent_issue ? `## Parent Issue\n#${task.parent_issue}` : ''}`;
}

// Create GitHub issue
async function createGitHubIssue(data, type) {
    const body = type === 'feature' ? formatFeatureBody(data) : formatTaskBody(data);
    const labels = [
        `${config.labelPrefix}:${type}`,
        `${config.labelPrefix}:${data.component?.toLowerCase().replace(/\s+/g, '-') || 'general'}`
    ];
    
    if (data.priority) {
        labels.push(`${config.labelPrefix}:priority-${data.priority.toLowerCase()}`);
    }

    try {
        const response = await octokit.issues.create({
            owner: config.owner,
            repo: config.repo,
            title: `[${type.toUpperCase()}] ${data.title}`,
            body: body,
            labels: labels
        });

        if (config.projectNumber) {
            await addIssueToProject(response.data.node_id, data);
        }

        console.log(`Created ${type}: ${data.title} (#${response.data.number})`);
        return response.data;
    } catch (error) {
        console.error(`Error creating ${type} "${data.title}":`, error.message);
    }
}

// Get Project ID
async function getProjectId() {
    try {
        // Try user project
        try {
            const userResponse = await octokit.graphql(`
                query($owner: String!, $number: Int!) {
                    user(login: $owner) {
                        projectV2(number: $number) {
                            id
                        }
                    }
                }
            `, {
                owner: config.owner,
                number: config.projectNumber
            });
            
            if (userResponse.user.projectV2) {
                return userResponse.user.projectV2.id;
            }
        } catch (error) {
            console.log('User project not found, trying repository project...');
        }
        
        // Try repository project
        const repoResponse = await octokit.graphql(`
            query($owner: String!, $repo: String!, $number: Int!) {
                repository(owner: $owner, name: $repo) {
                    projectV2(number: $number) {
                        id
                    }
                }
            }
        `, {
            owner: config.owner,
            repo: config.repo,
            number: config.projectNumber
        });
        
        return repoResponse.repository.projectV2.id;
    } catch (error) {
        console.error('Error getting project ID:', error.message);
        return null;
    }
}

// Add issue to project
async function addIssueToProject(issueId, data) {
    try {
        const projectId = await getProjectId();
        if (!projectId) return;

        const response = await octokit.graphql(`
            mutation($projectId: ID!, $issueId: ID!) {
                addProjectV2ItemById(input: {
                    projectId: $projectId
                    contentId: $issueId
                }) {
                    item {
                        id
                    }
                }
            }
        `, {
            projectId,
            issueId
        });

        if (response.addProjectV2ItemById.item.id) {
            await updateProjectItemFields(
                projectId,
                response.addProjectV2ItemById.item.id,
                data
            );
        }
    } catch (error) {
        console.error('Error adding issue to project:', error.message);
    }
}

// Update project item fields
async function updateProjectItemFields(projectId, itemId, data) {
    try {
        const fields = await getProjectFields(projectId);
        
        if (fields.status) {
            await updateProjectField(projectId, itemId, fields.status, '🆕 New');
        }
        if (fields.priority && data.priority) {
            await updateProjectField(projectId, itemId, fields.priority, `📌 ${data.priority}`);
        }
    } catch (error) {
        console.error('Error updating project item fields:', error.message);
    }
}

// Get project fields
async function getProjectFields(projectId) {
    try {
        const response = await octokit.graphql(`
            query($projectId: ID!) {
                node(id: $projectId) {
                    ... on ProjectV2 {
                        fields(first: 20) {
                            nodes {
                                ... on ProjectV2Field {
                                    id
                                    name
                                }
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
                }
            }
        `, {
            projectId
        });
        
        const fields = {};
        response.node.fields.nodes.forEach(field => {
            if (field.name === 'Status') fields.status = field;
            if (field.name === 'Priority') fields.priority = field;
        });
        
        return fields;
    } catch (error) {
        console.error('Error getting project fields:', error.message);
        return {};
    }
}

// Update a single project field
async function updateProjectField(projectId, itemId, field, value) {
    try {
        const optionId = field.options.find(opt => opt.name === value)?.id;
        if (!optionId) return;
        
        await octokit.graphql(`
            mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
                updateProjectV2ItemFieldValue(input: {
                    projectId: $projectId
                    itemId: $itemId
                    fieldId: $fieldId
                    value: { 
                        singleSelectOptionId: $optionId
                    }
                }) {
                    projectV2Item {
                        id
                    }
                }
            }
        `, {
            projectId,
            itemId,
            fieldId: field.id,
            optionId
        });
    } catch (error) {
        console.error(`Error updating field ${field.name}:`, error.message);
    }
}

// Main execution
async function main() {
    try {
        // Read the structured data
        const structureFile = path.join(__dirname, 'issue-structure.json');
        const structure = JSON.parse(fs.readFileSync(structureFile, 'utf8'));

        // Create features first
        console.log('Creating features...');
        for (const feature of structure.features) {
            await createGitHubIssue(feature, 'feature');
        }

        // Create tasks
        console.log('\nCreating tasks...');
        for (const task of structure.tasks) {
            await createGitHubIssue(task, 'task');
        }

        console.log('\nCompleted creating all issues!');
    } catch (error) {
        console.error('Error in main execution:', error.message);
        process.exit(1);
    }
}

// Run the script
main(); 
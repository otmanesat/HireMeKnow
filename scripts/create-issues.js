const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Octokit } = require('@octokit/rest');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = [
    'GITHUB_OWNER',
    'GITHUB_REPO',
    'GITHUB_TOKEN',
    'GITHUB_PROJECT_NUMBER'
];

function validateEnvironment() {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Configuration with defaults
const config = {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    projectNumber: parseInt(process.env.GITHUB_PROJECT_NUMBER),
    labelPrefix: process.env.GITHUB_LABEL_PREFIX || 'hiremknow',
    batchSize: parseInt(process.env.GITHUB_ISSUE_BATCH_SIZE) || 5,
    requestDelay: parseInt(process.env.GITHUB_REQUEST_DELAY) || 1000,
    defaultStatus: process.env.GITHUB_DEFAULT_STATUS || '🆕 New',
    defaultPriority: process.env.GITHUB_DEFAULT_PRIORITY || '📌 Medium',
    statusField: process.env.GITHUB_PROJECT_STATUS_FIELD || 'Status',
    priorityField: process.env.GITHUB_PROJECT_PRIORITY_FIELD || 'Priority',
    typeField: process.env.GITHUB_PROJECT_TYPE_FIELD || 'Type'
};

// Initialize Octokit
const octokit = new Octokit({ auth: config.token });

// Clean YAML content more aggressively
function cleanYamlContent(content) {
    // Remove any markdown code block markers
    content = content.replace(/^```ya?ml\s*\n/gm, '');
    content = content.replace(/\n```\s*$/gm, '');
    content = content.replace(/```\s*$/gm, '');
    
    // Remove any HTML/markdown artifacts
    content = content.replace(/<\/rewritten_file>/g, '');
    content = content.replace(/^\s*```\s*$/gm, '');
    
    // Remove any trailing whitespace or empty lines
    content = content.split('\n')
        .map(line => line.trimRight())
        .join('\n')
        .trim();
    
    // Debug log
    console.log('Cleaned YAML content:', content);
    
    return content;
}

// Read and parse issue templates with fallback
function getIssueTemplates() {
    const templateDir = path.join(__dirname, '../.github/ISSUE_TEMPLATE');
    const templates = {};
    
    // Default task template as fallback
    const defaultTaskTemplate = {
        name: 'Task',
        description: 'Create a new task',
        title: '[TASK] ',
        labels: ['task'],
        body: [
            {
                type: 'markdown',
                attributes: {
                    value: 'Create a new development task'
                }
            },
            {
                type: 'textarea',
                id: 'description',
                attributes: {
                    label: 'Task Description',
                    description: 'Detailed description of what needs to be done'
                },
                validations: {
                    required: true
                }
            }
        ]
    };
    
    fs.readdirSync(templateDir).forEach(file => {
        if (file.endsWith('.yml')) {
            console.log(`Processing template file: ${file}`);
            const templatePath = path.join(templateDir, file);
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            
            try {
                // First try to parse the raw content
                let template = yaml.load(templateContent, { schema: yaml.JSON_SCHEMA });
                if (!template) {
                    // If that fails, try cleaning the content
                    const cleanContent = cleanYamlContent(templateContent);
                    template = yaml.load(cleanContent, { schema: yaml.JSON_SCHEMA });
                }
                
                if (template) {
                    // Map both the file name and the template name
                    const baseName = file.replace('.yml', '');
                    templates[baseName] = template;
                    if (template.name) {
                        const normalizedName = template.name.toLowerCase().replace(/\s+/g, '-');
                        templates[normalizedName] = template;
                    }
                    console.log(`Successfully parsed template: ${file}`);
                } else {
                    console.error(`Failed to parse template ${file}: Template is empty`);
                    // Use default template for task.yml
                    if (file === 'task.yml') {
                        templates['task'] = defaultTaskTemplate;
                        templates['Task'] = defaultTaskTemplate;
                        console.log('Using default task template as fallback');
                    }
                }
            } catch (error) {
                console.error(`Error parsing template ${file}:`, error.message);
                // Use default template for task.yml
                if (file === 'task.yml') {
                    templates['task'] = defaultTaskTemplate;
                    templates['Task'] = defaultTaskTemplate;
                    console.log('Using default task template as fallback');
                }
            }
        }
    });
    
    // Ensure we have a task template
    if (!templates['task'] && !templates['Task']) {
        templates['task'] = defaultTaskTemplate;
        templates['Task'] = defaultTaskTemplate;
        console.log('Adding default task template as none was found');
    }
    
    // Debug log available templates
    console.log('Available templates:', Object.keys(templates));
    
    return templates;
}

// Check if an issue already exists
async function findExistingIssue(title) {
    try {
        const response = await octokit.issues.listForRepo({
            owner: config.owner,
            repo: config.repo,
            state: 'all',
            per_page: 100
        });

        const normalizedTitle = title.toLowerCase().trim();
        return response.data.find(issue => 
            issue.title.toLowerCase().trim() === normalizedTitle
        );
    } catch (error) {
        console.error('Error checking for existing issue:', error.message);
        return null;
    }
}

// Delete an existing issue
async function deleteIssue(issueNumber) {
    try {
        await octokit.issues.update({
            owner: config.owner,
            repo: config.repo,
            issue_number: issueNumber,
            state: 'closed'
        });
        console.log(`Closed existing issue #${issueNumber}`);
    } catch (error) {
        console.error(`Error closing issue #${issueNumber}:`, error.message);
    }
}

// Parse markdown files from githubissues folder
async function parseTaskFiles() {
    const issuesDir = path.join(__dirname, '../githubissues');
    const tasks = new Map(); // Use Map to handle duplicates
    
    // Read main category files
    const categoryFiles = fs.readdirSync(issuesDir)
        .filter(file => file.endsWith('.md') && !file.startsWith('.'));
    
    for (const file of categoryFiles) {
        const content = fs.readFileSync(path.join(issuesDir, file), 'utf8');
        const category = file.replace('.md', '');
        
        // Parse markdown content
        const lines = content.split('\n');
        let currentTask = null;
        
        for (const line of lines) {
            if (line.startsWith('## ')) {
                if (currentTask) {
                    tasks.set(currentTask.title, currentTask);
                }
                currentTask = {
                    category,
                    title: line.replace('## ', '').trim(),
                    description: '',
                    type: line.toLowerCase().includes('feature') ? 'feature' : 'task',
                    priority: config.defaultPriority,
                    status: config.defaultStatus
                };
            } else if (currentTask && line.trim()) {
                currentTask.description += line + '\n';
            }
        }
        
        if (currentTask) {
            tasks.set(currentTask.title, currentTask);
        }
    }
    
    // Read tasks directory if it exists
    const tasksDir = path.join(issuesDir, 'tasks');
    if (fs.existsSync(tasksDir)) {
        const taskFiles = fs.readdirSync(tasksDir)
            .filter(file => file.endsWith('.md'));
            
        for (const file of taskFiles) {
            const content = fs.readFileSync(path.join(tasksDir, file), 'utf8');
            const taskNumber = file.match(/TASK-(\d+)/)?.[1];
            
            if (taskNumber) {
                const title = content.split('\n')[0].replace('# ', '');
                const taskTitle = `Task ${taskNumber}: ${title}`;
                tasks.set(taskTitle, {
                    category: 'Detailed Tasks',
                    title: taskTitle,
                    description: content,
                    type: 'task',
                    priority: config.defaultPriority,
                    status: config.defaultStatus
                });
            }
        }
    }
    
    return Array.from(tasks.values());
}

// Prepare issue body using template
function prepareIssueBody(task, template) {
    let body = '';
    
    if (template.body) {
        template.body.forEach(field => {
            if (field.type === 'markdown') {
                body += field.attributes.value + '\n\n';
            } else if (field.type === 'textarea' && field.id === 'description') {
                body += `### Description\n${task.description}\n\n`;
            } else if (field.type === 'textarea' && field.id === 'implementation-details') {
                body += `### Implementation Details\n${task.description}\n\n`;
            }
        });
    } else {
        body = task.description;
    }
    
    return body.trim();
}

// Get Project ID using GraphQL for user projects
async function getProjectId() {
    try {
        // First try user project
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
        try {
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
            
            if (repoResponse.repository.projectV2) {
                return repoResponse.repository.projectV2.id;
            }
        } catch (error) {
            console.log('Repository project not found, trying organization project...');
        }
        
        // Try organization project
        const orgResponse = await octokit.graphql(`
            query($owner: String!, $number: Int!) {
                organization(login: $owner) {
                    projectV2(number: $number) {
                        id
                    }
                }
            }
        `, {
            owner: config.owner,
            number: config.projectNumber
        });
        
        return orgResponse.organization.projectV2.id;
    } catch (error) {
        console.error('Error getting project ID:', error.message);
        return null;
    }
}

// Create GitHub issue
async function createGitHubIssue(task, templates) {
    // Try to find the template using different possible keys
    const templateKeys = [
        task.type,
        task.type.toLowerCase(),
        task.type === 'task' ? 'Task' : task.type,
        task.type === 'feature' ? 'Feature' : task.type,
        // Add more variations
        'task',
        'Task'
    ];
    
    let template = null;
    for (const key of templateKeys) {
        if (templates[key]) {
            template = templates[key];
            break;
        }
    }
    
    if (!template) {
        console.error(`No template found for type: ${task.type}`);
        console.error('Available templates:', Object.keys(templates).join(', '));
        return;
    }
    
    // Check for existing issue
    const existingIssue = await findExistingIssue(task.title);
    if (existingIssue) {
        console.log(`Found existing issue #${existingIssue.number} for "${task.title}"`);
        await deleteIssue(existingIssue.number);
    }
    
    const body = prepareIssueBody(task, template);
    
    try {
        // Create the issue
        const response = await octokit.issues.create({
            owner: config.owner,
            repo: config.repo,
            title: task.title,
            body: body,
            labels: [`${config.labelPrefix}:${task.type}`, `${config.labelPrefix}:${task.category.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`]
        });
        
        // Add to project if project number is provided
        if (config.projectNumber) {
            const projectId = await getProjectId();
            if (projectId) {
                await addIssueToProject(response.data.node_id, projectId, task);
            } else {
                console.log('Skipping project assignment - no project found');
            }
        }
        
        console.log(`Created issue: ${task.title} (#${response.data.number})`);
        return response.data;
    } catch (error) {
        console.error(`Error creating issue for ${task.title}:`, error.message);
    }
}

// Add issue to project and update fields
async function addIssueToProject(issueId, projectId, task) {
    try {
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
                task
            );
        }
    } catch (error) {
        console.error('Error adding issue to project:', error.message);
    }
}

// Update project item fields
async function updateProjectItemFields(projectId, itemId, task) {
    try {
        const fields = await getProjectFields(projectId);
        
        if (fields.status) {
            await updateProjectField(projectId, itemId, fields.status, task.status);
        }
        if (fields.priority) {
            await updateProjectField(projectId, itemId, fields.priority, task.priority);
        }
        if (fields.type) {
            await updateProjectField(projectId, itemId, fields.type, task.type);
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
            if (field.name === config.statusField) fields.status = field;
            if (field.name === config.priorityField) fields.priority = field;
            if (field.name === config.typeField) fields.type = field;
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

// Process tasks in batches
async function processTasks(tasks, templates) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += config.batchSize) {
        batches.push(tasks.slice(i, i + config.batchSize));
    }
    
    for (const [index, batch] of batches.entries()) {
        console.log(`Processing batch ${index + 1} of ${batches.length}...`);
        await Promise.all(batch.map(task => createGitHubIssue(task, templates)));
        
        if (index < batches.length - 1) {
            console.log(`Waiting ${config.requestDelay}ms before next batch...`);
            await new Promise(resolve => setTimeout(resolve, config.requestDelay));
        }
    }
}

// Main execution
async function main() {
    try {
        // Validate environment
        validateEnvironment();
        
        console.log('Reading issue templates...');
        const templates = getIssueTemplates();
        
        if (Object.keys(templates).length === 0) {
            throw new Error('No valid templates found. Please check the template files.');
        }
        
        console.log('Found templates:', Object.keys(templates).join(', '));
        
        console.log('Parsing task files...');
        const tasks = await parseTaskFiles();
        
        console.log(`Found ${tasks.length} tasks to create...`);
        
        // Process tasks in batches
        await processTasks(tasks, templates);
        
        console.log('Completed creating all issues!');
    } catch (error) {
        console.error('Error in main execution:', error.message);
        process.exit(1);
    }
}

// Run the script
main(); 
const chalk = require('chalk');
require('dotenv').config();

const requiredEnvVars = ['GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_TOKEN'];

function checkEnvironment() {
  console.log(chalk.blue('Checking environment configuration...'));
  
  const missing = [];
  const configured = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      configured.push(varName);
    }
  });

  if (configured.length > 0) {
    console.log(chalk.green('\n✓ Configured environment variables:'));
    configured.forEach(varName => {
      const value = varName === 'GITHUB_TOKEN' 
        ? '********' 
        : process.env[varName];
      console.log(chalk.green(`  - ${varName}: ${value}`));
    });
  }

  if (missing.length > 0) {
    console.log(chalk.red('\n✗ Missing required environment variables:'));
    missing.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    console.log(chalk.yellow('\nPlease set these variables in your .env file or export them in your shell:'));
    console.log(chalk.yellow(`
Example .env file:
${missing.map(varName => `${varName}=your-${varName.toLowerCase()}`).join('\n')}
    `));
    process.exit(1);
  }

  // Check GitHub token permissions
  if (process.env.GITHUB_TOKEN) {
    console.log(chalk.blue('\nChecking GitHub token...'));
    const tokenFirstChar = process.env.GITHUB_TOKEN.charAt(0);
    if (tokenFirstChar !== 'g') {
      console.log(chalk.yellow('⚠️  Warning: Your GitHub token might not be valid.'));
      console.log(chalk.yellow('   Personal access tokens usually start with "ghp_"'));
    }
  }

  console.log(chalk.green('\n✓ Environment check completed successfully!'));
}

if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment }; 
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

const program = new Command();
program.version('1.0.0');

// Command to initiate the project
program
  .command('init <projectName>')
  .description('Initialize a new Node.js project with Express and Sequelize')
  .action((projectName) => {
    const projectPath = path.join(process.cwd(), projectName);
    
    // Create project folder
    fs.mkdirSync(projectPath);
    process.chdir(projectPath);
    
    // Initialize npm
    execSync('npm init -y', { stdio: 'inherit' });
    
    // Install dependencies
    execSync('npm install express sequelize mysql2', { stdio: 'inherit' });
    
    // Create files
    createAppJs(projectPath);
    createAppRouteJs(projectPath);
    createErrorHandler(projectPath);
    createExampleModule(projectPath);
    initializeSequelize(projectPath);
  });

// Command to create a new module
program
  .command('module-new <moduleName>')
  .description('Create a new module with the specified name')
  .action((moduleName) => {
    const projectPath = process.cwd();
    const modulePath = path.join(projectPath, moduleName);

    // Create the module folder and files
    createModuleFiles(modulePath, moduleName);

    // Add route reference to app.route.js
    updateAppRouteJs(moduleName, projectPath);
  });

function createAppJs(projectPath) {
  const appJsContent = `
  const express = require('express');
  const app = express();
  const PORT = 3000;

  // Use routes from app.route.js
  const routes = require('./app.route');
  app.use('/api', routes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      // Optionally include error stack for development (but never expose in production!)
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  });

  app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
  });
  `;
  fs.writeFileSync(path.join(projectPath, 'app.js'), appJsContent);
}

function createAppRouteJs(projectPath) {
  const appRouteContent = `
  const express = require('express');
  const router = express.Router();
  const AsyncHandler  = require('./error-handler')
  // Import routes from example module
  const exampleRoutes = require('./example/example.route');
  router.use('/example', AsyncHandler.handle(exampleRoutes));

  module.exports = router;
  `;
  fs.writeFileSync(path.join(projectPath, 'app.route.js'), appRouteContent);
}


function createErrorHandler(projectPath) {
  const errorHandlerContent = `
    class AsyncHandler {
      static handle(fn) {
        return (req, res, next) => {
          Promise.resolve(fn(req, res, next)).catch(next);
        };
      }
    }
  
    module.exports = AsyncHandler;
  `
  fs.writeFileSync(path.join(projectPath, 'error-handler.js'), errorHandlerContent);
}

function createExampleModule(projectPath) {
  const moduleDir = path.join(projectPath, 'example');
  fs.mkdirSync(moduleDir);

  const modelContent = `
  const { Sequelize, DataTypes } = require('sequelize');
  const sequelize = require('../config/database');

  const Example = sequelize.define('Example', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  module.exports = Example;
  `;

  const controllerContent = `
  const Example = require('./example.model');

  exports.getAllExamples = async (req, res) => {
    const allExample = await Example.findAll();
    res.status(200).json({ message: 'Examples got successfully', payload: { examples : allExample}, success: true });
  };
  `;

  const serviceContent = `
  const Example = require('./example.model');

  exports.createExample = async (data) => {
    return await Example.create(data);
  };
  `;

  const routeContent = `
  const express = require('express');
  const router = express.Router();
  const exampleController = require('./example.controller');

  // Define routes
  router.get('/', exampleController.getAllExamples);

  module.exports = router;
  `;

  // Create model, controller, service, and route files
  fs.writeFileSync(path.join(moduleDir, 'example.model.js'), modelContent);
  fs.writeFileSync(path.join(moduleDir, 'example.controller.js'), controllerContent);
  fs.writeFileSync(path.join(moduleDir, 'example.service.js'), serviceContent);
  fs.writeFileSync(path.join(moduleDir, 'example.route.js'), routeContent);
}

function initializeSequelize(projectPath) {
  const configDir = path.join(projectPath, 'config');
  fs.mkdirSync(configDir);

  const sequelizeConfig = `
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize('', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
  });

  module.exports = sequelize;
  `;

  fs.writeFileSync(path.join(configDir, 'database.js'), sequelizeConfig);
}

// Function to create new module files (model, controller, service, and route)
function createModuleFiles(modulePath, moduleName) {
  fs.mkdirSync(modulePath);

  const modelContent = `
  const { Sequelize, DataTypes } = require('sequelize');
  const sequelize = require('../config/database');

  const ${capitalize(moduleName)} = sequelize.define('${capitalize(moduleName)}', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  module.exports = ${capitalize(moduleName)};
  `;

  const controllerContent = `
  const ${capitalize(moduleName)} = require('./${moduleName}.model');

  exports.getAll${capitalize(moduleName)}s = async (req, res) => {
    try {
      const ${moduleName}s = await ${capitalize(moduleName)}.findAll();
      res.json(${moduleName}s);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ${moduleName}s' });
    }
  };
  `;

  const serviceContent = `
  const ${capitalize(moduleName)} = require('./${moduleName}.model');

  exports.create${capitalize(moduleName)} = async (data) => {
    return await ${capitalize(moduleName)}.create(data);
  };
  `;

  const routeContent = `
  const express = require('express');
  const router = express.Router();
  const ${moduleName}Controller = require('./${moduleName}.controller');

  // Define routes
  router.get('/', ${moduleName}Controller.getAll${capitalize(moduleName)}s);

  module.exports = router;
  `;

  // Write the files to the module directory
  fs.writeFileSync(path.join(modulePath, `${moduleName}.model.js`), modelContent);
  fs.writeFileSync(path.join(modulePath, `${moduleName}.controller.js`), controllerContent);
  fs.writeFileSync(path.join(modulePath, `${moduleName}.service.js`), serviceContent);
  fs.writeFileSync(path.join(modulePath, `${moduleName}.route.js`), routeContent);
}

function updateAppRouteJs(moduleName, projectPath) {
  const appRoutePath = path.join(projectPath, 'app.route.js');
  const newRouteImport = `  const ${moduleName}Routes = require('./${moduleName}/${moduleName}.route');\n`;
  const newRouteUse = `  router.use('/${moduleName}', ${moduleName}Routes);\n`;

  // Read the existing app.route.js file
  let appRouteContent = fs.readFileSync(appRoutePath, 'utf-8').trim(); // Remove extra spaces

  // Avoid duplicates
  if (!appRouteContent.includes(`${moduleName}Routes`)) {
    // Find the position after the last require statement
    const lastRequireIndex = appRouteContent.lastIndexOf('const');
    const requireInsertPosition = appRouteContent.indexOf('\n', lastRequireIndex) + 1;

    // Insert the new route import after the last require statement
    appRouteContent = appRouteContent.slice(0, requireInsertPosition) + newRouteImport + appRouteContent.slice(requireInsertPosition);

    // Find the position for inserting the new router.use() line before module.exports
    const useInsertPosition = appRouteContent.lastIndexOf('module.exports');
    
    // Insert the new router.use line before module.exports
    appRouteContent = appRouteContent.slice(0, useInsertPosition) + newRouteUse + appRouteContent.slice(useInsertPosition);

    // Write the updated content back to app.route.js with no extra spaces
    fs.writeFileSync(appRoutePath, appRouteContent.trim() + '\n'); // Trim extra spaces and add final newline
  }
}






// Helper function to capitalize the first letter of the module name
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

program.parse(process.argv);

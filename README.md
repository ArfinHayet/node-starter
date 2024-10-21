
---

# Node Starter CLI

**Node Starter CLI** is a tool that helps developers quickly set up a Node.js project with Express, Sequelize, and MySQL. It automatically generates a basic project structure, including an `app.js` file, routes, controllers, models, and services. This CLI is designed to make the process of creating new modules and linking them with routing efficient and easy.

## Features
- **Quick Project Initialization**: Sets up a Node.js project with Express and Sequelize.
- **Pre-configured with MySQL**: Sequelize is set up with MySQL for database interaction.
- **Auto-generated File Structure**: Creates controller, model, service, and route files for a default example module.
- **Module Creation**: Allows users to generate new modules with just one command.
- **Routing Setup**: Automatically links new modules in `app.route.js` for easy routing.

## Installation

You can install **Node Starter CLI** globally using npm:

```bash
npm install -g ness-m
```

## Usage

### 1. Initialize a new Node.js project
After installing the CLI, navigate to the directory where you want to create a new project and run:

```bash
ness-m init
```

This will:
- Create a basic project structure.
- Set up an `app.js` file that runs on port 3000.
- Initialize Sequelize and create a connection to MySQL.
- Generate an example module with a model, controller, service, and route.

### 2. Add a new module
To add a new module to the project, run:

```bash
ness-m module-new <module-name>
```

Replace `<module-name>` with the name of the module you want to create. This command will:
- Create a new module folder with a controller, service, and model.
- Add the module’s route reference to the `app.route.js` file.

### Example

```bash
# Initialize a new Node.js project
ness-m init

# Create a new module called 'products'
ness-m module-new products
```

### Generated File Structure

After initializing a project and creating a module, the file structure will look like this:

```
project-root/
│
├── app.js
├── app.route.js
├── example/
│   ├── example.controller.js
│   ├── example.model.js
│   ├── example.route.js
│   └── example.service.js
├── products/
│   ├── products.controller.js
│   ├── products.model.js
│   ├── products.route.js
│   └── products.service.js
└── config/
    └── database.js
```

## Requirements
- Node.js
- MySQL

## License

This project is licensed under the ISC License.

---
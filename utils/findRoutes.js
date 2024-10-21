const fs = require('fs');
const path = require('path');

function findRoutes(rootDir) {
  const routes = [];

  // Read all folders in the project root
  fs.readdirSync(rootDir).forEach(folder => {
    const folderPath = path.join(rootDir, folder);

    // Ensure it is a directory
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);

      // Look for .route.js files in the folder
      files.forEach(file => {
        if (file.endsWith('.route.js')) {
          routes.push(path.join(folderPath, file)); // Add the full path of the route
        }
      });
    }
  });

  return routes;
}

module.exports = findRoutes;

const fs = require('fs');
const path = require('path');

function getAllModels(rootDir) {
  const models = {};

  // Read all folders in the project root
  fs.readdirSync(rootDir).forEach(folder => {
    const folderPath = path.join(rootDir, folder);
    
    // Ensure it is a directory
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      
      // Look for .model.js files in the folder
      files.forEach(file => {
        if (file.endsWith('.model.js')) {
          const modelPath = path.join(folderPath, file);
          const model = require(modelPath);
          models[file.replace('.model.js', '')] = model.rawAttributes;
        }
      });
    }
  });

  return models;
}

module.exports = getAllModels;

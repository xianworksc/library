/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
🚀 XianFire Model & Express Controller Generator

Usage:
  xian create:model <ModelName>
  xian create:controller <ControllerName>

Examples:
  xian create:model User
  xian create:controller userController

Note: Controller names are typically camelCase (e.g., userController, productController)
`);
  process.exit(0);
}

const type = args[0]; // 'model' or 'controller'
const name = args[1]; // e.g., 'User' or 'userController'

// Ensure directories exist
const ensureDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// PascalCase for model names
const toPascalCase = (str) => {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// camelCase for controller names
const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

// Generate Model (Sequelize for MySQL, Mongoose for MongoDB, Firestore helpers for Firebase)
const createModel = async (modelName) => {
  const modelDir = path.join(process.cwd(), 'models');
  await ensureDir(modelDir);

  const pascalName = toPascalCase(modelName);
  const modelPath = path.join(modelDir, `${pascalName}.js`);

  let modelContent = `
  /*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
  // Firebase doesn't require predefined models.
  // Use Firestore directly in controllers or create helper functions here.
  // Collection name: "${pascalName.toLowerCase()}"

  import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";


export const ${pascalName} = sequelize.define("${pascalName.toLowerCase()}", {

  FirstName: { type: DataTypes.STRING, allowNull: false },
  LastName: { type: DataTypes.STRING, allowNull: false },
  MiddleName: { type: DataTypes.STRING, allowNull: false },
  Program: { type: DataTypes.STRING, allowNull: false },
  YearLevel: { type: DataTypes.STRING, allowNull: false },
  Section: { type: DataTypes.STRING, allowNull: false },
});
export { sequelize }; 
  `.trim();

  await fs.writeFile(modelPath, modelContent);
  console.log(`✅ Model created: ${modelPath}`);
};

// Generate Express Controller (named exports)
const createController = async (controllerName) => {
  const controllerDir = path.join(process.cwd(), 'controllers');
  await ensureDir(controllerDir);

  const camelName = toCamelCase(controllerName); // e.g., userController
  const pascalModelName = toPascalCase(camelName.replace(/controller$/, '')); // e.g., User
  const controllerPath = path.join(controllerDir, `${camelName}.js`);

  const controllerContent = `
/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
import { ${pascalModelName}, sequelize } from "../models/${pascalModelName}.js";
await sequelize.sync();
const ${camelName} ={
  index: async (req, res) => {
    res.send("Index Page");
  },
};
export { ${camelName} };
`.trim();

  await fs.writeFile(controllerPath, controllerContent);
  console.log(`✅ Express Controller created: ${controllerPath}`);
};

// Run based on type
(async () => {
  try {
    if (type === 'model') {
      await createModel(name);
    } else if (type === 'controller') {
      await createController(name);
    } else {
      console.error('❌ Unknown type. Use "model" or "controller".');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
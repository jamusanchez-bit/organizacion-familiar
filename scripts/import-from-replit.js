import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para convertir datos de Replit al formato local
function convertInventoryData(replitData) {
  return replitData.map(item => ({
    name: item.name,
    quantity: parseFloat(item.current_quantity) || 0,
    unit: item.unit,
    category: item.category,
    minimum_stock: parseFloat(item.minimum_quantity) || 1
  }));
}

function convertRecipeData(replitData) {
  return replitData.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    category: recipe.category || 'general',
    prep_time: recipe.prep_time || 30,
    instructions: recipe.instructions || recipe.description || 'Sin instrucciones'
  }));
}

function convertRecipeIngredients(replitData) {
  return replitData.map(ingredient => ({
    recipe_id: ingredient.recipe_id,
    ingredient_name: ingredient.ingredient_name || ingredient.name,
    quantity: parseFloat(ingredient.quantity) || 1,
    unit: ingredient.unit || 'unidades'
  }));
}

async function importData() {
  try {
    console.log('📦 Importando datos desde Replit...');
    
    // Leer archivo de inventario
    const inventoryPath = '/Users/mgt/Downloads/inventory_items.json';
    if (!fs.existsSync(inventoryPath)) {
      console.error('❌ No se encontró inventory_items.json en Downloads/');
      return;
    }
    
    const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    const convertedInventory = convertInventoryData(inventoryData);
    
    console.log(`✅ Inventario: ${convertedInventory.length} items`);
    
    // Buscar archivos de recetas
    let recipes = [];
    let recipeIngredients = [];
    
    const recipesPath = '/Users/mgt/Downloads/recipes.json';
    if (fs.existsSync(recipesPath)) {
      const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
      recipes = convertRecipeData(recipesData);
      console.log(`✅ Recetas: ${recipes.length} items`);
    }
    
    const ingredientsPath = '/Users/mgt/Downloads/recipe_ingredients.json';
    if (fs.existsSync(ingredientsPath)) {
      const ingredientsData = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'));
      recipeIngredients = convertRecipeIngredients(ingredientsData);
      console.log(`✅ Ingredientes: ${recipeIngredients.length} items`);
    }
    
    // Crear nuevo seedData.ts
    const seedDataContent = `// Datos importados desde Replit - ${new Date().toISOString()}

export const SAMPLE_INVENTORY = ${JSON.stringify(convertedInventory, null, 2)};

export const SAMPLE_RECIPES = ${JSON.stringify(recipes, null, 2)};

export const SAMPLE_RECIPE_INGREDIENTS = ${JSON.stringify(recipeIngredients, null, 2)};
`;
    
    const seedDataPath = path.join(__dirname, '../server/seedData.ts');
    fs.writeFileSync(seedDataPath, seedDataContent);
    
    console.log('🎉 ¡Datos importados correctamente!');
    console.log('📁 Archivo actualizado: server/seedData.ts');
    console.log('🔄 Reinicia el servidor para ver los cambios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

importData();
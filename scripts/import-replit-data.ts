// Script para importar datos exportados desde Replit
import fs from 'fs';
import path from 'path';
import { storage } from '../server/storage';

interface ExportedData {
  inventory: any[];
  recipes: any[];
  recipeIngredients: any[];
  exportDate: string;
}

async function importData() {
  try {
    const dataPath = path.join(__dirname, 'family-app-data-export.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ No se encontró el archivo family-app-data-export.json');
      console.log('Coloca el archivo exportado desde Replit en la carpeta scripts/');
      return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data: ExportedData = JSON.parse(rawData);

    console.log('📦 Importando datos...');
    console.log(`- ${data.inventory.length} items de inventario`);
    console.log(`- ${data.recipes.length} recetas`);
    console.log(`- ${data.recipeIngredients.length} ingredientes`);

    // Limpiar datos existentes
    await storage.query('DELETE FROM recipe_ingredients');
    await storage.query('DELETE FROM recipes');
    await storage.query('DELETE FROM inventory');

    // Importar inventario
    for (const item of data.inventory) {
      await storage.query(`
        INSERT INTO inventory (name, quantity, unit, category, minimum_stock)
        VALUES ($1, $2, $3, $4, $5)
      `, [item.name, item.quantity, item.unit, item.category, item.minimum_stock || 1]);
    }

    // Importar recetas
    const recipeIdMap = new Map();
    for (const recipe of data.recipes) {
      const result = await storage.query(`
        INSERT INTO recipes (name, category, prep_time, instructions)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [recipe.name, recipe.category, recipe.prep_time, recipe.instructions]);
      
      recipeIdMap.set(recipe.id, result.rows[0].id);
    }

    // Importar ingredientes de recetas
    for (const ingredient of data.recipeIngredients) {
      const newRecipeId = recipeIdMap.get(ingredient.recipe_id);
      if (newRecipeId) {
        await storage.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
          VALUES ($1, $2, $3, $4)
        `, [newRecipeId, ingredient.ingredient_name, ingredient.quantity, ingredient.unit]);
      }
    }

    console.log('✅ Datos importados correctamente');
    console.log(`Fecha de exportación original: ${data.exportDate}`);

  } catch (error) {
    console.error('❌ Error importando datos:', error);
  }
}

importData();
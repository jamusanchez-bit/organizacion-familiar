// Script para exportar datos desde Replit PostgreSQL
// Ejecutar esto en tu proyecto de Replit

const { Client } = require('pg');
const fs = require('fs');

async function exportData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Exportar inventario
    const inventoryResult = await client.query('SELECT * FROM inventory ORDER BY id');
    console.log(`Encontrados ${inventoryResult.rows.length} items de inventario`);

    // Exportar recetas
    const recipesResult = await client.query('SELECT * FROM recipes ORDER BY id');
    console.log(`Encontradas ${recipesResult.rows.length} recetas`);

    // Exportar ingredientes de recetas
    const ingredientsResult = await client.query('SELECT * FROM recipe_ingredients ORDER BY recipe_id, id');
    console.log(`Encontrados ${ingredientsResult.rows.length} ingredientes de recetas`);

    // Crear archivo de exportación
    const exportData = {
      inventory: inventoryResult.rows,
      recipes: recipesResult.rows,
      recipeIngredients: ingredientsResult.rows,
      exportDate: new Date().toISOString()
    };

    // Guardar como JSON
    fs.writeFileSync('family-app-data-export.json', JSON.stringify(exportData, null, 2));
    console.log('✅ Datos exportados a family-app-data-export.json');

    // También crear versión legible
    let readable = '=== INVENTARIO ===\n';
    exportData.inventory.forEach(item => {
      readable += `${item.name} - ${item.quantity} ${item.unit} (${item.category})\n`;
    });

    readable += '\n=== RECETAS ===\n';
    exportData.recipes.forEach(recipe => {
      readable += `\n${recipe.name}\n`;
      readable += `Categoría: ${recipe.category}\n`;
      readable += `Tiempo: ${recipe.prep_time} min\n`;
      readable += `Instrucciones: ${recipe.instructions}\n`;
      
      const ingredients = exportData.recipeIngredients.filter(ing => ing.recipe_id === recipe.id);
      if (ingredients.length > 0) {
        readable += 'Ingredientes:\n';
        ingredients.forEach(ing => {
          readable += `  - ${ing.ingredient_name}: ${ing.quantity} ${ing.unit}\n`;
        });
      }
      readable += '---\n';
    });

    fs.writeFileSync('family-app-data-readable.txt', readable);
    console.log('✅ Versión legible guardada en family-app-data-readable.txt');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportData();
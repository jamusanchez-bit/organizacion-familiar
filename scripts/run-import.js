const fs = require('fs');
const path = require('path');

// Simular el storage para importar datos
const importData = async () => {
  try {
    const dataPath = path.join(__dirname, 'family-app-data-export.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ No se encontró family-app-data-export.json en scripts/');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log('📦 Datos encontrados:');
    console.log(`- ${data.inventory?.length || 0} items de inventario`);
    console.log(`- ${data.recipes?.length || 0} recetas`);
    console.log(`- ${data.recipeIngredients?.length || 0} ingredientes`);
    
    // Actualizar seedData.ts con los datos reales
    const seedDataPath = path.join(__dirname, '../server/seedData.ts');
    
    let newSeedData = `// Datos importados desde Replit
export const SAMPLE_INVENTORY = ${JSON.stringify(data.inventory || [], null, 2)};

export const SAMPLE_RECIPES = ${JSON.stringify(data.recipes || [], null, 2)};

export const SAMPLE_RECIPE_INGREDIENTS = ${JSON.stringify(data.recipeIngredients || [], null, 2)};
`;

    fs.writeFileSync(seedDataPath, newSeedData);
    console.log('✅ Datos actualizados en seedData.ts');
    console.log('🔄 Reinicia el servidor para aplicar los cambios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

importData();
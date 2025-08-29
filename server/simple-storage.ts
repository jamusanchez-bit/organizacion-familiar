// Storage simple en memoria para desarrollo local
import { SAMPLE_INVENTORY, SAMPLE_RECIPES, SAMPLE_RECIPE_INGREDIENTS } from './seedData';

// Convertir datos a formato con IDs
let inventory = SAMPLE_INVENTORY.map((item, index) => ({
  id: `inv_${index}`,
  userId: 'any',
  name: item.name,
  currentQuantity: item.quantity.toString(),
  minimumQuantity: item.minimum_stock.toString(),
  unit: item.unit,
  category: item.category,
  createdAt: new Date(),
  updatedAt: new Date()
}));

let recipes = SAMPLE_RECIPES.map((recipe, index) => ({
  id: recipe.id || `rec_${index}`,
  userId: 'any',
  name: recipe.name,
  category: recipe.category,
  prepTime: recipe.prep_time,
  instructions: recipe.instructions,
  createdAt: new Date(),
  updatedAt: new Date()
}));

let recipeIngredients = SAMPLE_RECIPE_INGREDIENTS.map((ing, index) => ({
  id: `ing_${index}`,
  recipeId: ing.recipe_id,
  inventoryItemId: `inv_0`,
  ingredientName: 'Ingrediente',
  quantity: ing.quantity.toString(),
  unit: ing.unit
}));

let activities: any[] = [];
let meals: any[] = [];
let shoppingList: any[] = [];
let messages: any[] = [];

export const simpleStorage = {
  // User methods
  getUser: async (id: string) => ({ id, email: `${id}@app.local`, firstName: id }),
  upsertUser: async (user: any) => user,
  
  // Inventory methods
  getUserInventoryItems: async (userId: string) => inventory,
  getLowStockItems: async (userId: string) => inventory.filter(item => 
    parseFloat(item.currentQuantity) <= parseFloat(item.minimumQuantity)
  ),
  createInventoryItem: async (userId: string, item: any) => {
    const newItem = { ...item, id: `inv_${Date.now()}`, userId, createdAt: new Date(), updatedAt: new Date() };
    inventory.push(newItem);
    return newItem;
  },
  updateInventoryItem: async (id: string, userId: string, updates: any) => {
    const index = inventory.findIndex(item => item.id === id);
    if (index >= 0) {
      inventory[index] = { ...inventory[index], ...updates, updatedAt: new Date() };
      return inventory[index];
    }
    return undefined;
  },
  deleteInventoryItem: async (id: string, userId: string) => {
    const index = inventory.findIndex(item => item.id === id);
    if (index >= 0) {
      inventory.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Recipe methods
  getUserRecipes: async (userId: string) => recipes,
  getRecipesByCategory: async (userId: string, category: string) => 
    recipes.filter(recipe => recipe.category === category),
  getRecipeWithIngredients: async (id: string, userId: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return undefined;
    const ingredients = recipeIngredients.filter(ing => ing.recipeId === id);
    return { ...recipe, ingredients };
  },
  createRecipe: async (userId: string, recipe: any) => {
    const newRecipe = { ...recipe, id: `rec_${Date.now()}`, userId, createdAt: new Date(), updatedAt: new Date() };
    recipes.push(newRecipe);
    return newRecipe;
  },
  updateRecipe: async (id: string, userId: string, updates: any) => {
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index >= 0) {
      recipes[index] = { ...recipes[index], ...updates, updatedAt: new Date() };
      return recipes[index];
    }
    return undefined;
  },
  deleteRecipe: async (id: string, userId: string) => {
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index >= 0) {
      recipes.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Recipe ingredients
  getRecipeIngredients: async (recipeId: string) => 
    recipeIngredients.filter(ing => ing.recipeId === recipeId),
  addRecipeIngredient: async (ingredient: any) => {
    const newIngredient = { ...ingredient, id: `ing_${Date.now()}` };
    recipeIngredients.push(newIngredient);
    return newIngredient;
  },
  updateRecipeIngredient: async (id: string, updates: any) => {
    const index = recipeIngredients.findIndex(ing => ing.id === id);
    if (index >= 0) {
      recipeIngredients[index] = { ...recipeIngredients[index], ...updates };
      return recipeIngredients[index];
    }
    return undefined;
  },
  deleteRecipeIngredient: async (id: string) => {
    const index = recipeIngredients.findIndex(ing => ing.id === id);
    if (index >= 0) {
      recipeIngredients.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Activities
  getUserActivities: async (userId: string) => activities,
  getActivitiesByDate: async (userId: string, date: string) => 
    activities.filter(act => act.date === date),
  createActivity: async (userId: string, activity: any) => {
    const newActivity = { ...activity, id: `act_${Date.now()}`, userId, createdAt: new Date(), updatedAt: new Date() };
    activities.push(newActivity);
    return newActivity;
  },
  updateActivity: async (id: string, userId: string, updates: any) => {
    const index = activities.findIndex(act => act.id === id);
    if (index >= 0) {
      activities[index] = { ...activities[index], ...updates, updatedAt: new Date() };
      return activities[index];
    }
    return undefined;
  },
  updateActivityCompletion: async (id: string, userId: string, isCompleted: boolean) => {
    const index = activities.findIndex(act => act.id === id);
    if (index >= 0) {
      activities[index] = { ...activities[index], isCompleted, updatedAt: new Date() };
      return activities[index];
    }
    return undefined;
  },
  deleteActivity: async (id: string, userId: string) => {
    const index = activities.findIndex(act => act.id === id);
    if (index >= 0) {
      activities.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Meals
  getMealPlan: async (userId: string, weekStart: string) => 
    meals.filter(meal => meal.weekStart === weekStart),
  createMealPlan: async (userId: string, meal: any) => {
    const newMeal = { ...meal, id: `meal_${Date.now()}`, userId, createdAt: new Date(), updatedAt: new Date() };
    meals.push(newMeal);
    return newMeal;
  },
  updateMealPlan: async (id: string, userId: string, updates: any) => {
    const index = meals.findIndex(meal => meal.id === id);
    if (index >= 0) {
      meals[index] = { ...meals[index], ...updates, updatedAt: new Date() };
      return meals[index];
    }
    return undefined;
  },
  deleteMealPlan: async (id: string, userId: string) => {
    const index = meals.findIndex(meal => meal.id === id);
    if (index >= 0) {
      meals.splice(index, 1);
      return true;
    }
    return false;
  },
  markMealCompleted: async (id: string, userId: string) => {
    const index = meals.findIndex(meal => meal.id === id);
    if (index >= 0) {
      meals[index] = { ...meals[index], isCompleted: true, updatedAt: new Date() };
      return meals[index];
    }
    return undefined;
  },
  
  // Shopping list
  getShoppingList: async (userId: string) => shoppingList,
  getShoppingListSuggestions: async (userId: string) => 
    inventory.filter(item => parseFloat(item.currentQuantity) <= 1),
  addShoppingListItem: async (userId: string, item: any) => {
    const newItem = { ...item, id: `shop_${Date.now()}`, userId, createdAt: new Date(), updatedAt: new Date() };
    shoppingList.push(newItem);
    return newItem;
  },
  updateShoppingListItem: async (id: string, userId: string, updates: any) => {
    const index = shoppingList.findIndex(item => item.id === id);
    if (index >= 0) {
      shoppingList[index] = { ...shoppingList[index], ...updates, updatedAt: new Date() };
      return shoppingList[index];
    }
    return undefined;
  },
  deleteShoppingListItem: async (id: string, userId: string) => {
    const index = shoppingList.findIndex(item => item.id === id);
    if (index >= 0) {
      shoppingList.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Messages
  getMessages: async (userId: string, type?: string, recipient?: string) => 
    messages.filter(msg => !type || msg.messageType === type),
  createMessage: async (userId: string, message: any) => {
    const newMessage = { ...message, id: `msg_${Date.now()}`, userId, createdAt: new Date() };
    messages.push(newMessage);
    return newMessage;
  },
  deleteMessage: async (id: string, userId: string) => {
    const index = messages.findIndex(msg => msg.id === id);
    if (index >= 0) {
      messages.splice(index, 1);
      return true;
    }
    return false;
  }
};

console.log('✅ Datos cargados en memoria!');
console.log(`📦 ${inventory.length} inventario, ${recipes.length} recetas`);
console.log('🚀 Servidor listo con datos de Replit');

export const storage = simpleStorage;
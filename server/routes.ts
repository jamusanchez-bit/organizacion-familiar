import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
// import { setupAuth, isAuthenticated } from "./replitAuth"; // Replit auth disabled
import authRoutes from "./authRoutes";
import { insertActivitySchema, insertMealSchema, insertInventoryItemSchema, insertRecipeSchema, insertRecipeIngredientSchema, insertShoppingListSchema, insertMessageSchema } from "@shared/schema";
// import { seedDatabase } from "./seedData";
import { z } from "zod";

// Simple authentication middleware for local development
const isAuthenticated = (req: any, res: Response, next: NextFunction) => {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app); // Replit auth setup disabled
  
  // Simple auth routes (for independent deployment)
  app.use(authRoutes);
  
  // Login redirect route
  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });
  
  // Logout route
  app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  // Auth routes - compatible with both systems
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Auto-seed disabled for simple storage
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Alias for simple auth compatibility
  app.get('/api/simple-auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Return user data in expected format
      res.json({
        id: userId,
        email: `${userId}@app.local`,
        firstName: userId.charAt(0).toUpperCase() + userId.slice(1)
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      
      const activities = date 
        ? await storage.getActivitiesByDate(userId, date as string)
        : await storage.getUserActivities(userId);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityData = insertActivitySchema.parse(req.body);
      
      const activity = await storage.createActivity(userId, activityData);
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.put('/api/activities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const activityData = insertActivitySchema.partial().parse(req.body);
      
      const activity = await storage.updateActivity(id, userId, activityData);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.put('/api/activities/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { isCompleted } = req.body;
      
      const activity = await storage.updateActivityCompletion(id, userId, isCompleted);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity completion:", error);
      res.status(500).json({ message: "Failed to update activity completion" });
    }
  });

  app.delete('/api/activities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteActivity(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Legacy meal routes for backward compatibility
  app.get('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  // New meal planning routes
  app.get('/api/meal-plan/:weekStart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStart } = req.params;
      const meals = await storage.getMealPlan(userId, weekStart);
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  app.post('/api/meal-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = insertMealSchema.parse(req.body);
      
      const meal = await storage.createMealPlan(userId, mealData);
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      console.error("Error creating meal plan:", error);
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.put('/api/meal-plan/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const mealData = insertMealSchema.partial().parse(req.body);
      
      const meal = await storage.updateMealPlan(id, userId, mealData);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      console.error("Error updating meal plan:", error);
      res.status(500).json({ message: "Failed to update meal plan" });
    }
  });

  app.put('/api/meal-plan/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const meal = await storage.markMealCompleted(id, userId);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }

      // If meal has a recipe, deduct ingredients from inventory
      if (meal.recipeId) {
        const ingredients = await storage.getRecipeIngredients(meal.recipeId);
        for (const ingredient of ingredients) {
          const allItems = await storage.getUserInventoryItems(userId);
          const currentItem = allItems.find(item => item.id === ingredient.inventoryItemId);
          if (currentItem) {
            const newQuantity = Math.max(0, parseFloat(currentItem.currentQuantity) - parseFloat(ingredient.quantity));
            await storage.updateInventoryItem(ingredient.inventoryItemId, userId, {
              currentQuantity: newQuantity.toString()
            });
          }
        }
      }
      
      res.json(meal);
    } catch (error) {
      console.error("Error marking meal completed:", error);
      res.status(500).json({ message: "Failed to mark meal completed" });
    }
  });

  app.delete('/api/meal-plan/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteMealPlan(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      res.json({ message: "Meal deleted successfully" });
    } catch (error) {
      console.error("Error deleting meal:", error);
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserInventoryItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get('/api/inventory/low-stock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getLowStockItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post('/api/inventory', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertInventoryItemSchema.parse(req.body);
      
      const item = await storage.createInventoryItem(userId, itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put('/api/inventory/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const itemData = insertInventoryItemSchema.partial().parse(req.body);
      
      const item = await storage.updateInventoryItem(id, userId, itemData);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete('/api/inventory/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteInventoryItem(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category } = req.query;
      
      const recipes = category 
        ? await storage.getRecipesByCategory(userId, category as string)
        : await storage.getUserRecipes(userId);
      
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const recipe = await storage.getRecipeWithIngredients(id, userId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeData = insertRecipeSchema.parse(req.body);
      
      const recipe = await storage.createRecipe(userId, recipeData);
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const recipeData = insertRecipeSchema.partial().parse(req.body);
      
      const recipe = await storage.updateRecipe(id, userId, recipeData);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteRecipe(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Recipe ingredient routes
  app.get('/api/recipes/:id/ingredients', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const ingredients = await storage.getRecipeIngredients(id);
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching recipe ingredients:", error);
      res.status(500).json({ message: "Failed to fetch recipe ingredients" });
    }
  });

  app.post('/api/recipes/:id/ingredients', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const ingredientData = insertRecipeIngredientSchema.parse({
        ...req.body,
        recipeId: id
      });
      
      const ingredient = await storage.addRecipeIngredient(ingredientData);
      res.json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      console.error("Error adding recipe ingredient:", error);
      res.status(500).json({ message: "Failed to add recipe ingredient" });
    }
  });

  app.put('/api/recipe-ingredients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const ingredientData = insertRecipeIngredientSchema.partial().parse(req.body);
      
      const ingredient = await storage.updateRecipeIngredient(id, ingredientData);
      if (!ingredient) {
        return res.status(404).json({ message: "Recipe ingredient not found" });
      }
      
      res.json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      console.error("Error updating recipe ingredient:", error);
      res.status(500).json({ message: "Failed to update recipe ingredient" });
    }
  });

  app.delete('/api/recipe-ingredients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteRecipeIngredient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe ingredient not found" });
      }
      
      res.json({ message: "Recipe ingredient deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe ingredient:", error);
      res.status(500).json({ message: "Failed to delete recipe ingredient" });
    }
  });

  // Shopping list routes
  app.get('/api/shopping-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shoppingList = await storage.getShoppingList(userId);
      res.json(shoppingList);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });

  app.post('/api/shopping-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertShoppingListSchema.parse(req.body);
      
      const item = await storage.addShoppingListItem(userId, itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      console.error("Error adding shopping list item:", error);
      res.status(500).json({ message: "Failed to add shopping list item" });
    }
  });

  app.put('/api/shopping-list/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const itemData = insertShoppingListSchema.partial().parse(req.body);
      
      const item = await storage.updateShoppingListItem(id, userId, itemData);
      if (!item) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      console.error("Error updating shopping list item:", error);
      res.status(500).json({ message: "Failed to update shopping list item" });
    }
  });

  app.delete('/api/shopping-list/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteShoppingListItem(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      res.json({ message: "Shopping list item deleted successfully" });
    } catch (error) {
      console.error("Error deleting shopping list item:", error);
      res.status(500).json({ message: "Failed to delete shopping list item" });
    }
  });

  // Suggestion endpoint to get inventory items for shopping list suggestions
  app.get('/api/shopping-list/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestions = await storage.getShoppingListSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching shopping list suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Messages routes
  app.get('/api/messages/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;
      const { recipient } = req.query;
      
      const messages = await storage.getMessages(userId, type, recipient as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.createMessage(userId, messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.delete('/api/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteMessage(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Shopping List Routes
  app.get('/api/shopping-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shoppingList = await storage.getShoppingList(userId);
      res.json(shoppingList);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });

  app.get('/api/shopping-list/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestions = await storage.getShoppingListSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching shopping suggestions:", error);
      res.status(500).json({ message: "Failed to fetch shopping suggestions" });
    }
  });

  app.post('/api/shopping-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertShoppingListSchema.parse(req.body);
      
      const newItem = await storage.addShoppingListItem(userId, itemData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shopping list item data", errors: error.errors });
      }
      console.error("Error adding shopping list item:", error);
      res.status(500).json({ message: "Failed to add shopping list item" });
    }
  });

  app.patch('/api/shopping-list/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updates = insertShoppingListSchema.partial().parse(req.body);

      const updatedItem = await storage.updateShoppingListItem(id, userId, updates);
      if (!updatedItem) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shopping list item data", errors: error.errors });
      }
      console.error("Error updating shopping list item:", error);
      res.status(500).json({ message: "Failed to update shopping list item" });
    }
  });

  app.delete('/api/shopping-list/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const success = await storage.deleteShoppingListItem(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }

      res.json({ message: "Shopping list item deleted successfully" });
    } catch (error) {
      console.error("Error deleting shopping list item:", error);
      res.status(500).json({ message: "Failed to delete shopping list item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

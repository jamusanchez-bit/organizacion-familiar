import {
  users,
  activities,
  meals,
  inventoryItems,
  recipes,
  recipeIngredients,
  shoppingList,
  messages,
  type User,
  type UpsertUser,
  type Activity,
  type InsertActivity,
  type Meal,
  type InsertMeal,
  type InventoryItem,
  type InsertInventoryItem,
  type Recipe,
  type InsertRecipe,
  type RecipeIngredient,
  type InsertRecipeIngredient,
  type ShoppingListItem,
  type InsertShoppingListItem,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lte, not, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Activity operations
  getUserActivities(userId: string): Promise<Activity[]>;
  getActivitiesByDate(userId: string, date: string): Promise<Activity[]>;
  createActivity(userId: string, activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, userId: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string, userId: string): Promise<boolean>;
  updateActivityCompletion(id: string, userId: string, isCompleted: boolean): Promise<Activity | undefined>;
  
  // Meal operations
  getUserMeals(userId: string): Promise<Meal[]>;
  getMealsByDate(userId: string, date: string): Promise<Meal[]>;
  createMeal(userId: string, meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, userId: string, meal: Partial<InsertMeal>): Promise<Meal | undefined>;
  deleteMeal(id: string, userId: string): Promise<boolean>;
  getMealPlan(userId: string, weekStart: string): Promise<Meal[]>;
  createMealPlan(userId: string, meal: InsertMeal): Promise<Meal>;
  updateMealPlan(id: string, userId: string, meal: Partial<InsertMeal>): Promise<Meal | undefined>;
  deleteMealPlan(id: string, userId: string): Promise<boolean>;
  markMealCompleted(id: string, userId: string): Promise<Meal | undefined>;
  
  // Inventory operations
  getUserInventoryItems(userId: string): Promise<InventoryItem[]>;
  getLowStockItems(userId: string): Promise<InventoryItem[]>;
  createInventoryItem(userId: string, item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string, userId: string): Promise<boolean>;
  
  // Recipe operations
  getUserRecipes(userId: string): Promise<Recipe[]>;
  getRecipesByCategory(userId: string, category: string): Promise<Recipe[]>;
  getRecipeWithIngredients(id: string, userId: string): Promise<Recipe & { ingredients: (RecipeIngredient & { inventoryItem: InventoryItem })[] } | undefined>;
  createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, userId: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string, userId: string): Promise<boolean>;
  
  // Recipe ingredient operations
  addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient>;
  updateRecipeIngredient(id: string, ingredient: Partial<InsertRecipeIngredient>): Promise<RecipeIngredient | undefined>;
  deleteRecipeIngredient(id: string): Promise<boolean>;
  getRecipeIngredients(recipeId: string): Promise<(RecipeIngredient & { inventoryItem: InventoryItem })[]>;
  
  // Shopping list operations
  getShoppingList(userId: string): Promise<ShoppingListItem[]>;
  addShoppingListItem(userId: string, item: InsertShoppingListItem): Promise<ShoppingListItem>;
  updateShoppingListItem(id: string, userId: string, item: Partial<InsertShoppingListItem>): Promise<ShoppingListItem | undefined>;
  deleteShoppingListItem(id: string, userId: string): Promise<boolean>;
  getShoppingListSuggestions(userId: string): Promise<InventoryItem[]>; // Items with quantity <= 1
  
  // Message operations
  getMessages(userId: string, type?: string, recipient?: string): Promise<Message[]>;
  createMessage(userId: string, message: InsertMessage): Promise<Message>;
  deleteMessage(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Activity operations
  async getUserActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date), asc(activities.time));
  }

  async getActivitiesByDate(userId: string, date: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(and(eq(activities.userId, userId), eq(activities.date, date)))
      .orderBy(asc(activities.time));
  }

  async createActivity(userId: string, activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({ ...activity, userId })
      .returning();
    return newActivity;
  }

  async updateActivity(id: string, userId: string, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set({ ...activity, updatedAt: new Date() })
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();
    return updatedActivity;
  }

  async updateActivityCompletion(id: string, userId: string, isCompleted: boolean): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set({ isCompleted, updatedAt: new Date() })
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();
    return updatedActivity;
  }

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)));
    return result.rowCount > 0;
  }

  // Meal operations - Weekly meal planning
  async getMealPlan(userId: string, weekStart: string): Promise<Meal[]> {
    return await db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.weekStart, weekStart)))
      .orderBy(asc(meals.dayOfWeek), asc(meals.mealType));
  }

  async createMealPlan(userId: string, meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db
      .insert(meals)
      .values({ ...meal, userId })
      .returning();
    return newMeal;
  }

  async updateMealPlan(id: string, userId: string, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const [updatedMeal] = await db
      .update(meals)
      .set({ ...meal, updatedAt: new Date() })
      .where(and(eq(meals.id, id), eq(meals.userId, userId)))
      .returning();
    return updatedMeal;
  }

  async deleteMealPlan(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(meals)
      .where(and(eq(meals.id, id), eq(meals.userId, userId)));
    return result.rowCount > 0;
  }

  async markMealCompleted(id: string, userId: string): Promise<Meal | undefined> {
    const [meal] = await db
      .update(meals)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(and(eq(meals.id, id), eq(meals.userId, userId)))
      .returning();
    return meal;
  }

  // Legacy methods for backward compatibility
  async getUserMeals(userId: string): Promise<Meal[]> {
    return await db.select().from(meals).where(eq(meals.userId, userId));
  }

  async getMealsByDate(userId: string, date: string): Promise<Meal[]> {
    return [];
  }

  async createMeal(userId: string, meal: InsertMeal): Promise<Meal> {
    // This is a legacy method and should not be used.
    return this.createMealPlan(userId, meal);
  }

  async updateMeal(id: string, userId: string, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    // This is a legacy method and should not be used.
    return this.updateMealPlan(id, userId, meal);
  }

  async deleteMeal(id: string, userId: string): Promise<boolean> {
    // This is a legacy method and should not be used.
    return this.deleteMealPlan(id, userId);
  }

  // Inventory operations
  async getUserInventoryItems(userId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.userId, userId))
      .orderBy(asc(inventoryItems.name));
  }

  async getLowStockItems(userId: string): Promise<InventoryItem[]> {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.userId, userId));
    
    return items.filter(item => 
      Number(item.currentQuantity) <= Number(item.minimumQuantity)
    );
  }

  async createInventoryItem(userId: string, item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db
      .insert(inventoryItems)
      .values({ ...item, userId })
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)));
    return result.rowCount > 0;
  }

  // Recipe operations
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(asc(recipes.category), asc(recipes.name));
  }

  async getRecipesByCategory(userId: string, category: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.userId, userId), eq(recipes.category, category)))
      .orderBy(asc(recipes.name));
  }

  async getRecipeWithIngredients(id: string, userId: string): Promise<Recipe & { ingredients: (RecipeIngredient & { inventoryItem: InventoryItem })[] } | undefined> {
    // Get the recipe
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

    if (!recipe) return undefined;

    // Get ingredients with inventory item details
    const ingredients = await db
      .select()
      .from(recipeIngredients)
      .leftJoin(inventoryItems, eq(recipeIngredients.inventoryItemId, inventoryItems.id))
      .where(eq(recipeIngredients.recipeId, id));

    const formattedIngredients = ingredients.map(({ recipe_ingredients, inventory_items }) => ({
      ...recipe_ingredients,
      inventoryItem: inventory_items!
    }));

    return {
      ...recipe,
      ingredients: formattedIngredients
    };
  }

  async createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values({ ...recipe, userId })
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: string, userId: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set({ ...recipe, updatedAt: new Date() })
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();
    return updatedRecipe;
  }

  async deleteRecipe(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return result.rowCount > 0;
  }

  // Recipe ingredient operations
  async addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient> {
    const [newIngredient] = await db
      .insert(recipeIngredients)
      .values(ingredient)
      .returning();
    return newIngredient;
  }

  async updateRecipeIngredient(id: string, ingredient: Partial<InsertRecipeIngredient>): Promise<RecipeIngredient | undefined> {
    const [updatedIngredient] = await db
      .update(recipeIngredients)
      .set(ingredient)
      .where(eq(recipeIngredients.id, id))
      .returning();
    return updatedIngredient;
  }

  async deleteRecipeIngredient(id: string): Promise<boolean> {
    const result = await db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.id, id));
    return result.rowCount > 0;
  }

  async getRecipeIngredients(recipeId: string): Promise<(RecipeIngredient & { inventoryItem: InventoryItem })[]> {
    const ingredients = await db
      .select()
      .from(recipeIngredients)
      .leftJoin(inventoryItems, eq(recipeIngredients.inventoryItemId, inventoryItems.id))
      .where(eq(recipeIngredients.recipeId, recipeId));

    return ingredients.map(({ recipe_ingredients, inventory_items }) => ({
      ...recipe_ingredients,
      inventoryItem: inventory_items!
    }));
  }

  // Shopping list operations
  async getShoppingList(userId: string): Promise<ShoppingListItem[]> {
    const items = await db
      .select()
      .from(shoppingList)
      .where(eq(shoppingList.userId, userId))
      .orderBy(asc(shoppingList.category), desc(shoppingList.createdAt));
    return items;
  }

  async addShoppingListItem(userId: string, item: InsertShoppingListItem): Promise<ShoppingListItem> {
    const [newItem] = await db
      .insert(shoppingList)
      .values({ ...item, userId })
      .returning();
    return newItem;
  }

  async updateShoppingListItem(id: string, userId: string, item: Partial<InsertShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const [updatedItem] = await db
      .update(shoppingList)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(shoppingList.id, id), eq(shoppingList.userId, userId)))
      .returning();
    return updatedItem;
  }

  async deleteShoppingListItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(shoppingList)
      .where(and(eq(shoppingList.id, id), eq(shoppingList.userId, userId)));
    return result.rowCount > 0;
  }

  async getShoppingListSuggestions(userId: string): Promise<InventoryItem[]> {
    // Get items with quantity <= 1 that are not already in shopping list
    const existingShoppingItems = await db
      .select({ inventoryItemId: shoppingList.inventoryItemId })
      .from(shoppingList)
      .where(and(
        eq(shoppingList.userId, userId),
        eq(shoppingList.isPurchased, false)
      ));

    const existingIds = existingShoppingItems
      .map(item => item.inventoryItemId)
      .filter(id => id !== null);

    const suggestions = await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.userId, userId),
        lte(inventoryItems.currentQuantity, "1.0")
      ))
      .orderBy(asc(inventoryItems.name));

    // Filter out items that are already in shopping list
    return suggestions.filter(item => !existingIds.includes(item.id));
  }

  // Message operations
  async getMessages(userId: string, type?: string, recipient?: string): Promise<Message[]> {
    let whereConditions: any = [];
    
    if (type === 'forum') {
      whereConditions.push(eq(messages.messageType, 'forum'));
    } else if (type === 'admin_suggestion') {
      whereConditions.push(eq(messages.messageType, 'admin_suggestion'));
    } else if (type === 'private') {
      // Get the current user's name from their ID
      const currentUserName = this.getUserNameFromId(userId);
      
      whereConditions.push(eq(messages.messageType, 'private'));
      
      if (recipient) {
        // Get messages between current user and specific recipient
        // This would need OR logic in a real implementation
        // For now, we'll get all private messages and filter in memory
      }
    }
    
    let result = await db
      .select()
      .from(messages)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(asc(messages.createdAt)); // Changed to ascending for chat-like order
    
    // Filter private messages if recipient is specified
    if (type === 'private' && recipient) {
      const currentUserName = this.getUserNameFromId(userId);
      result = result.filter(msg => 
        (msg.senderName === currentUserName && msg.recipientName === recipient) ||
        (msg.senderName === recipient && msg.recipientName === currentUserName)
      );
    }
    
    return result;
  }

  private getUserNameFromId(userId: string): string {
    // Map user IDs to names based on your user system
    const userMap: Record<string, string> = {
      'javier': 'javier',
      'raquel': 'raquel', 
      'mario': 'mario',
      'alba': 'alba',
      'javi_administrador': 'javier'
    };
    return userMap[userId] || userId;
  }

  private getUserNameFromEmail(email: string): string {
    if (email.includes('jamusanchez')) return 'javier';
    // Add other email mappings as needed
    return 'usuario';
  }

  async createMessage(userId: string, message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({ ...message, userId })
      .returning();
    return newMessage;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(messages)
      .where(and(eq(messages.id, id), eq(messages.userId, userId)));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();

import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  date,
  time,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedTo: varchar("assigned_to").notNull(), // 'javier', 'raquel', 'mario', 'alba'
  title: varchar("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: time("time").notNull(),
  durationMinutes: integer("duration_minutes").default(60), // Duration in minutes
  category: varchar("category").notNull(),
  isCompleted: boolean("is_completed").default(false),
  // Repetition fields
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type"), // 'daily', 'weekly', 'monthly'
  recurringDays: text("recurring_days"), // JSON array of days for weekly (e.g., '[1,3,5]' for Mon,Wed,Fri)
  recurringEndDate: date("recurring_end_date"), // When to stop creating recurring events
  parentId: varchar("parent_id"), // Reference to original activity if this is a recurring instance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meals table - Weekly meal planning
export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(), // Monday date of the week
  dayOfWeek: integer("day_of_week").notNull(), // 0=Monday, 1=Tuesday, ..., 6=Sunday
  mealType: varchar("meal_type").notNull(), // 'desayuno_alba_mario', 'desayuno_raquel_javier', 'almuerzo_alba_mario', 'almuerzo_raquel_javier', 'comida', 'merienda_alba_mario', 'merienda_raquel_javier', 'cena'
  content: text("content"), // Free text content
  recipeId: varchar("recipe_id").references(() => recipes.id, { onDelete: "set null" }), // Optional recipe reference
  isCompleted: boolean("is_completed").default(false), // Track if meal is completed to deduct ingredients
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  currentQuantity: decimal("current_quantity", { precision: 10, scale: 2 }).notNull(),
  minimumQuantity: decimal("minimum_quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(), // kg, g, l, ml, pieces, etc.
  purchaseLocation: varchar("purchase_location").notNull().default("otros"), // Carnicería online, Pescadería, Del bancal a casa, Alcampo, Lidl, Internet, Otros
  icon: varchar("icon").default("fas fa-utensils"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // desayunos, almuerzos, comidas, meriendas, cenas
  instructions: text("instructions"),
  preparationTime: integer("preparation_time"), // minutes
  crockpotFunction: varchar("crockpot_function"), // alta, baja
  servings: integer("servings").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipe ingredients table (junction table between recipes and inventory items)
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: varchar("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(), // unit for this specific ingredient in the recipe
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping list table
export const shoppingList = pgTable("shopping_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // 'carniceria_online', 'pescaderia', 'del_bancal_a_casa', 'alcampo', 'lidl', 'internet', 'otros'
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(),
  isPurchased: boolean("is_purchased").default(false),
  isAutoAdded: boolean("is_auto_added").default(false), // Added automatically when inventory quantity = 0
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id, { onDelete: "set null" }), // Link to original inventory item if auto-added
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table for forum-style communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  senderName: varchar("sender_name").notNull(), // 'javier', 'raquel', 'mario', 'alba'
  recipientName: varchar("recipient_name"), // null for public forum, 'javier' for admin suggestions, specific user for private messages
  messageType: varchar("message_type").notNull(), // 'forum', 'admin_suggestion', 'private'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  meals: many(meals),
  inventoryItems: many(inventoryItems),
  recipes: many(recipes),
  shoppingList: many(shoppingList),
  messages: many(messages),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
  recipeIngredients: many(recipeIngredients),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  recipeIngredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [recipeIngredients.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const shoppingListRelations = relations(shoppingList, ({ one }) => ({
  user: one(users, {
    fields: [shoppingList.userId],
    references: [users.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [shoppingList.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  parentId: true, // This is set automatically for recurring instances
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
  createdAt: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingList).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;
export type ShoppingListItem = typeof shoppingList.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

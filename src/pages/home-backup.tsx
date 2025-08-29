import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { getDailyQuote, getFormattedDate } from "@/utils/dailyQuotes";
import { getUserRole, getUserPermissions, canAccessSection, PURCHASE_CATEGORIES } from "@/utils/userPermissions";
import SimpleSidebar from "@/components/sidebar-simple";
import ActivityModal from "@/components/activity-modal";
import MealModal from "@/components/meal-modal";
import MealCalendar from "@/components/meal-calendar";
import ActivitiesCalendar from "@/components/activities-calendar";
import InventoryModal from "@/components/inventory-modal";
import InventoryEditModal from "@/components/inventory-edit-modal";
import QuickStockUpdate from "@/components/quick-stock-update";
import RecipeModal from "@/components/recipe-modal";
import RecipeEditModal from "@/components/recipe-edit-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Package, AlertTriangle, Plus, Menu, Edit2, ChefHat, Clock, Users, Zap, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Activity, Meal, InventoryItem, Recipe, RecipeIngredient, ShoppingListItem, Message } from "@shared/schema";

// Helper function to format quantities without unnecessary decimals
const formatQuantity = (quantity: string | number): string => {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
};

// Categories for filtering inventory
const inventoryCategories = [
  { value: 'all', label: 'Todas las categorías', count: 0 },
  { value: 'frutas', label: 'Frutas', count: 0 },
  { value: 'verduras', label: 'Verduras', count: 0 },
  { value: 'carnes', label: 'Carnes', count: 0 },
  { value: 'pescado', label: 'Pescado', count: 0 },
  { value: 'lacteos', label: 'Lácteos', count: 0 },
  { value: 'granos', label: 'Granos', count: 0 },
  { value: 'frutos_secos', label: 'Frutos Secos', count: 0 },
  { value: 'bebidas', label: 'Bebidas', count: 0 },
  { value: 'condimentos', label: 'Condimentos', count: 0 },
  { value: 'limpieza_hogar', label: 'Productos de Limpieza/Hogar', count: 0 },
  { value: 'otros', label: 'Otros', count: 0 },
];

// Recipe categories
const recipeCategories = [
  { value: 'all', label: 'Todas las recetas', count: 0 },
  { value: 'desayunos', label: 'Desayunos', count: 0 },
  { value: 'almuerzos', label: 'Almuerzos', count: 0 },
  { value: 'comidas', label: 'Comidas', count: 0 },
  { value: 'meriendas', label: 'Meriendas', count: 0 },
  { value: 'cenas', label: 'Cenas', count: 0 },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Messages states
  const [selectedMessageType, setSelectedMessageType] = useState<'forum' | 'admin' | 'private'>('forum');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');

  // Escuchar evento de cerrar sidebar móvil
  useEffect(() => {
    const handleCloseMobileSidebar = () => {
      setSidebarOpen(false);
    };
    
    window.addEventListener('closeMobileSidebar', handleCloseMobileSidebar);
    return () => window.removeEventListener('closeMobileSidebar', handleCloseMobileSidebar);
  }, []);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const today = format(new Date(), 'yyyy-MM-dd');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    enabled: isAuthenticated,
  });

  // Fetch today's activities
  const { data: todayActivities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities', today],
    enabled: isAuthenticated,
  });

  // Fetch meals
  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
    enabled: isAuthenticated,
  });

  // Fetch today's meals
  const { data: todayMeals = [] } = useQuery<Meal[]>({
    queryKey: ['/api/meals', today],
    enabled: isAuthenticated,
  });

  // Fetch inventory
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    enabled: isAuthenticated,
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory/low-stock'],
    enabled: isAuthenticated,
  });

  // Fetch recipes
  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const renderDashboard = () => {
    const todayActivities = activities?.filter(activity => 
      activity.date === format(new Date(), 'yyyy-MM-dd') && 
      activity.assignedTo === currentUser
    ) || [];
    
    return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-neutral-800 mb-2">Inicio</h2>
        <p className="text-lg text-neutral-700 mb-2">{formattedDate}</p>
        <blockquote className="text-neutral-600 italic border-l-4 border-blue-500 pl-4 mb-4">
          "{dailyQuote}"
        </blockquote>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-neutral-200" data-testid="card-stats-activities">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Actividades Hoy</p>
                <p className="text-2xl font-bold text-neutral-800">{todayActivities.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200" data-testid="card-stats-meals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Comidas Hoy</p>
                <p className="text-2xl font-bold text-neutral-800">{todayMeals.length}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Utensils className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200" data-testid="card-stats-inventory">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Items en Stock</p>
                <p className="text-2xl font-bold text-neutral-800">{inventory.length}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Package className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200" data-testid="card-stats-low-stock">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-accent">{lowStockItems.length}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <AlertTriangle className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activities */}
        <Card className="border-neutral-200" data-testid="card-today-activities">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Actividades de Hoy</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('activities')}
                data-testid="button-view-all-activities"
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
              {todayActivities.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No hay actividades para hoy</p>
              ) : (
                todayActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 bg-neutral-50 rounded-lg" data-testid={`activity-${activity.id}`}>
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">{activity.title}</p>
                      <p className="text-sm text-neutral-500">{activity.time}</p>
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                      {activity.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <Card className="border-neutral-200" data-testid="card-today-meals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Comidas de Hoy</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('meals')}
                data-testid="button-view-meal-plan"
              >
                Ver plan
              </Button>
            </div>
            <div className="space-y-3">
              {todayMeals.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No hay comidas planificadas</p>
              ) : (
                todayMeals.slice(0, 3).map((meal) => (
                  <div key={meal.id} className="flex items-center p-3 bg-neutral-50 rounded-lg" data-testid={`meal-${meal.id}`}>
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                      <Utensils className="text-secondary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800 capitalize">{meal.mealType}</p>
                      <p className="text-sm text-neutral-500">{meal.content || 'Sin contenido'}</p>
                    </div>
                    <span className="text-xs text-neutral-400">Plan semanal</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="mt-8 border-accent/20 bg-accent/5" data-testid="card-low-stock-alerts">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-accent mr-2 h-5 w-5" />
              <h3 className="text-lg font-semibold text-neutral-800">Alertas de Stock Bajo</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center p-3 bg-accent/5 border border-accent/20 rounded-lg" data-testid={`low-stock-${item.id}`}>
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                    <Package className="text-accent h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{item.name}</p>
                    <p className="text-sm text-accent">Quedan {formatQuantity(item.currentQuantity)} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderActivities = () => (
    <ActivitiesCalendar />
  );

  const renderMeals = () => (
    <MealCalendar />
  );

  const renderInventory = () => {
    // Filter inventory by selected category
    const filteredInventory = selectedCategory === 'all' 
      ? inventory 
      : inventory.filter(item => item.category === selectedCategory);

    // Calculate category counts
    const categoriesWithCounts = inventoryCategories.map(cat => ({
      ...cat,
      count: cat.value === 'all' ? inventory.length : inventory.filter(item => item.category === cat.value).length
    }));

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Inventario de Alimentos</h2>
            <p className="text-neutral-600">Controla tu stock de ingredientes y alimentos</p>
          </div>
          <Button 
            onClick={() => setShowInventoryModal(true)}
            className="bg-secondary hover:bg-secondary/90"
            data-testid="button-new-inventory-item"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>

        {/* Category Filter */}
        {inventory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">Filtrar por categoría</h3>
            <div className="flex flex-wrap gap-2">
              {categoriesWithCounts.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`text-xs ${selectedCategory === category.value ? 'bg-secondary text-white' : 'text-neutral-600'}`}
                  data-testid={`filter-category-${category.value}`}
                  disabled={category.count === 0 && category.value !== 'all'}
                >
                  {category.label}
                  {category.count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs">
                      {category.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

      {inventoryLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando inventario...</p>
        </div>
      ) : inventory.length === 0 ? (
        <Card className="border-neutral-200" data-testid="empty-inventory">
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-500">No tienes productos en tu inventario</p>
            <Button 
              onClick={() => setShowInventoryModal(true)}
              variant="outline"
              className="mt-4"
              data-testid="button-add-first-item"
            >
              Agregar primer producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => {
            const currentQty = Number(item.currentQuantity);
            const minQty = Number(item.minimumQuantity);
            const percentage = minQty > 0 ? (currentQty / minQty) * 100 : 100;
            const isLowStock = currentQty <= minQty;

            return (
              <Card key={item.id} className="border-neutral-200" data-testid={`inventory-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Package className="text-secondary h-6 w-6" />
                    </div>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        isLowStock ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {isLowStock ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-neutral-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-neutral-500 mb-3 capitalize">{item.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-600">Cantidad:</span>
                    <span className="font-semibold text-neutral-800">{formatQuantity(item.currentQuantity)} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-600">Mínimo:</span>
                    <span className="font-semibold text-neutral-800">{formatQuantity(item.minimumQuantity)} {item.unit}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${isLowStock ? 'bg-accent' : 'bg-secondary'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  {/* Botón de editar */}
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingInventoryItem(item)}
                      className="text-xs"
                      data-testid={`button-edit-item-${item.id}`}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>

                  {/* Actualización rápida de stock */}
                  <QuickStockUpdate item={item} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    );
  };

  const renderRecipes = () => {
    // Filter recipes by selected category
    const filteredRecipes = selectedRecipeCategory === 'all' 
      ? recipes 
      : recipes.filter(recipe => recipe.category === selectedRecipeCategory);

    // Calculate category counts
    const categoriesWithCounts = recipeCategories.map(cat => ({
      ...cat,
      count: cat.value === 'all' ? recipes.length : recipes.filter(recipe => recipe.category === cat.value).length
    }));

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Recetas</h2>
            <p className="text-neutral-600">Organiza tus recetas por categorías usando ingredientes de tu inventario</p>
          </div>
          <Button 
            onClick={() => setShowRecipeModal(true)}
            className="bg-secondary hover:bg-secondary/90"
            data-testid="button-new-recipe"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Receta
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">Categorías de recetas</h3>
          <div className="flex flex-wrap gap-2">
            {categoriesWithCounts.map((category) => (
              <Button
                key={category.value}
                variant={selectedRecipeCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRecipeCategory(category.value)}
                className={`text-xs ${selectedRecipeCategory === category.value ? 'bg-secondary text-white' : 'text-neutral-600'}`}
                data-testid={`filter-recipe-category-${category.value}`}
              >
                {category.label}
                {category.count > 0 && (
                  <span className="ml-2 px-2 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs">
                    {category.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {recipesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-neutral-600">Cargando recetas...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <Card className="border-neutral-200" data-testid="empty-recipes">
            <CardContent className="p-8 text-center">
              <ChefHat className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <p className="text-neutral-500">
                {selectedRecipeCategory === 'all' 
                  ? 'No tienes recetas guardadas' 
                  : `No tienes recetas en la categoría "${categoriesWithCounts.find(cat => cat.value === selectedRecipeCategory)?.label}"`
                }
              </p>
              <Button 
                onClick={() => setShowRecipeModal(true)}
                variant="outline"
                className="mt-4"
                data-testid="button-add-first-recipe"
              >
                Agregar primera receta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="border-neutral-200 hover:shadow-md transition-shadow" data-testid={`recipe-card-${recipe.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <ChefHat className="text-secondary h-6 w-6" />
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700 capitalize">
                      {recipe.category}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-neutral-800 mb-2">{recipe.name}</h4>
                  {recipe.description && (
                    <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{recipe.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-neutral-600 mb-3">
                    <div className="flex items-center justify-between">
                      {recipe.preparationTime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{(recipe.preparationTime / 60).toFixed(1)} h</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{recipe.servings} porción{recipe.servings > 1 ? 'es' : ''}</span>
                        </div>
                      )}
                    </div>
                    {recipe.crockpotFunction && (
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        <span className="capitalize">Crockpot: {recipe.crockpotFunction}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* TODO: View recipe details */}}
                      className="flex-1 text-xs"
                      data-testid={`button-view-recipe-${recipe.id}`}
                    >
                      Ver Receta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRecipe(recipe)}
                      className="text-xs"
                      data-testid={`button-edit-recipe-${recipe.id}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Shopping List Section
  const { data: shoppingList = [], refetch: refetchShoppingList } = useQuery<ShoppingListItem[]>({
    queryKey: ['/api/shopping-list'],
    enabled: activeTab === 'shopping-list'
  });

  const { data: suggestions = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/shopping-list/suggestions'],
    enabled: activeTab === 'shopping-list'
  });

  // Shopping list categories
  const shoppingCategories = [
    { value: 'carniceria_online', label: 'Carnicería online', color: 'bg-red-100 text-red-800' },
    { value: 'pescaderia', label: 'Pescadería', color: 'bg-blue-100 text-blue-800' },
    { value: 'del_bancal_a_casa', label: 'Del bancal a casa', color: 'bg-green-100 text-green-800' },
    { value: 'alcampo', label: 'Alcampo', color: 'bg-orange-100 text-orange-800' },
    { value: 'lidl', label: 'Lidl', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'internet', label: 'Internet', color: 'bg-purple-100 text-purple-800' },
    { value: 'otros', label: 'Otros', color: 'bg-gray-100 text-gray-800' }
  ];

  const renderShoppingList = () => {
    // Group items by category
    const itemsByCategory = shoppingList.reduce((acc: Record<string, ShoppingListItem[]>, item: ShoppingListItem) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Lista de la compra</h1>
            <p className="text-neutral-600">Organiza tus compras por categorías</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shopping list by categories */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Lista actual</h2>
              
              {shoppingCategories.map(category => {
                const categoryItems = itemsByCategory[category.value] || [];
                const uncompletedItems = categoryItems.filter(item => !item.isPurchased);
                
                if (uncompletedItems.length === 0) return null;
                
                return (
                  <div key={category.value} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-neutral-800">{category.label}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                        {uncompletedItems.length} {uncompletedItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {uncompletedItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={item.isPurchased}
                              onChange={(e) => {
                                updateShoppingItemMutation.mutate({
                                  id: item.id,
                                  updates: { isPurchased: e.target.checked }
                                });
                              }}
                              className="rounded"
                              data-testid={`checkbox-shopping-${item.id}`}
                            />
                            <div>
                              <span className="text-sm font-medium text-neutral-800">{item.name}</span>
                              <span className="text-xs text-neutral-500 ml-2">
                                {formatQuantity(item.quantity)} {item.unit}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              deleteShoppingItemMutation.mutate(item.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-delete-shopping-${item.id}`}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {shoppingList.filter(item => !item.isPurchased).length === 0 && (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-neutral-500">No tienes items en tu lista de compra</p>
                </div>
              )}
            </div>

            {/* Suggestions and add new item */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Sugerencias y añadir items</h2>
              
              {/* Items with low stock (suggestions) */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-neutral-800 mb-3">Sugerencias (stock bajo)</h3>
                  <div className="space-y-2">
                    {suggestions.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <div>
                          <span className="text-sm font-medium text-neutral-800">{item.name}</span>
                          <span className="text-xs text-neutral-500 ml-2">
                            Quedan: {formatQuantity(item.currentQuantity)} {item.unit}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addShoppingItemMutation.mutate({
                              name: item.name,
                              quantity: item.minimumQuantity || 1,
                              unit: item.unit,
                              category: item.purchaseLocation || 'otros',
                              inventoryItemId: item.id,
                              isPurchased: false
                            });
                          }}
                          data-testid={`button-add-suggestion-${item.id}`}
                        >
                          Añadir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add new item manually */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-neutral-800 mb-3">Añadir item manualmente</h3>
                <Button
                  className="w-full"
                  onClick={() => {
                    // TODO: Show add item modal
                  }}
                  data-testid="button-add-shopping-item"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir nuevo item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Messages Section

  // Get user name for messaging
  const getUserName = () => {
    const email = (user as any)?.email || '';
    if (email.includes('jamusanchez')) return 'javier';
    // Map other emails to user names as needed
    return 'usuario';
  };

  const { data: forumMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', { type: 'forum' }],
    enabled: activeTab === 'messages' && selectedMessageType === 'forum'
  });

  const { data: adminMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', { type: 'admin_suggestion' }],
    enabled: activeTab === 'messages' && selectedMessageType === 'admin'
  });

  const { data: privateMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', { type: 'private', recipient: selectedRecipient }],
    enabled: activeTab === 'messages' && selectedMessageType === 'private' && !!selectedRecipient
  });

  const userNames = ['javier', 'raquel', 'mario', 'alba'];
  const currentUser = user?.name?.toLowerCase().split(' ')[0] || 'javier';
  const userRole = getUserRole(user?.email || '');
  const dailyQuote = getDailyQuote();
  const formattedDate = getFormattedDate();

  // Shopping list mutations
  const addShoppingItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!response.ok) throw new Error('Failed to add item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list/suggestions'] });
      toast({ title: "Item añadido a la lista de compra" });
    },
    onError: () => {
      toast({ title: "Error al añadir item", variant: "destructive" });
    }
  });

  const updateShoppingItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
    }
  });

  const deleteShoppingItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
      toast({ title: "Item eliminado de la lista" });
    },
    onError: () => {
      toast({ title: "Error al eliminar item", variant: "destructive" });
    }
  });

  // Message mutations
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant message queries
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage('');
      toast({ title: "Mensaje enviado" });
    },
    onError: () => {
      toast({ title: "Error al enviar mensaje", variant: "destructive" });
    }
  });

  const renderMessages = () => {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Mensajes</h1>
            <p className="text-neutral-600">Comunícate con otros usuarios</p>
          </div>

          {/* Message type selector */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
              <Button
                variant={selectedMessageType === 'forum' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMessageType('forum')}
                data-testid="button-message-forum"
              >
                Foro público
              </Button>
              <Button
                variant={selectedMessageType === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMessageType('admin')}
                data-testid="button-message-admin"
              >
                Sugerencias a Javier
              </Button>
              <Button
                variant={selectedMessageType === 'private' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMessageType('private')}
                data-testid="button-message-private"
              >
                Mensajes privados
              </Button>
            </div>
          </div>

          {/* Forum messages */}
          {selectedMessageType === 'forum' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Esta semana quiero que hablemos de:</h3>
              
              {/* Messages list */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {forumMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-800 capitalize">{message.senderName}</span>
                      <span className="text-xs text-neutral-500">
                        {format(new Date(message.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-neutral-700">{message.content}</p>
                  </div>
                ))}
                
                {forumMessages.length === 0 && (
                  <p className="text-neutral-500 text-center py-4">
                    No hay mensajes en el foro. ¡Sé el primero en escribir!
                  </p>
                )}
              </div>

              {/* New message input */}
              <div className="border-t pt-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje al foro..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  data-testid="textarea-forum-message"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => {
                      sendMessageMutation.mutate({
                        messageType: 'forum',
                        content: newMessage,
                        senderName: currentUser,
                        recipientName: null
                      });
                    }}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-forum-message"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin suggestions */}
          {selectedMessageType === 'admin' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Sugerencias para Javier (administrador)</h3>
              
              {/* Messages list */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {adminMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-green-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-800 capitalize">{message.senderName}</span>
                      <span className="text-xs text-neutral-500">
                        {format(new Date(message.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-neutral-700">{message.content}</p>
                  </div>
                ))}
                
                {adminMessages.length === 0 && (
                  <p className="text-neutral-500 text-center py-4">
                    No hay sugerencias. Envía una sugerencia a Javier.
                  </p>
                )}
              </div>

              {/* New suggestion input */}
              <div className="border-t pt-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu sugerencia para Javier..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  data-testid="textarea-admin-message"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => {
                      sendMessageMutation.mutate({
                        messageType: 'admin_suggestion',
                        content: newMessage,
                        senderName: currentUser,
                        recipientName: 'javier'
                      });
                    }}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-admin-message"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar sugerencia
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Private messages */}
          {selectedMessageType === 'private' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Mensajes privados</h3>
              
              {/* Recipient selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Selecciona destinatario:
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  data-testid="select-recipient"
                >
                  <option value="">Selecciona un usuario...</option>
                  {userNames
                    .filter(name => name !== currentUser)
                    .map(name => (
                      <option key={name} value={name} className="capitalize">
                        {name}
                      </option>
                    ))}
                </select>
              </div>

              {selectedRecipient && (
                <>
                  {/* Messages list */}
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {privateMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`${
                          message.senderName === currentUser 
                            ? 'ml-auto bg-blue-100 border-l-4 border-blue-400' 
                            : 'mr-auto bg-gray-100 border-l-4 border-gray-400'
                        } max-w-xs p-3 rounded-lg`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-neutral-800 capitalize">
                            {message.senderName === currentUser ? 'Tú' : message.senderName}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {format(new Date(message.createdAt || new Date()), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-neutral-700">{message.content}</p>
                      </div>
                    ))}
                    
                    {privateMessages.length === 0 && (
                      <p className="text-neutral-500 text-center py-4">
                        No hay mensajes con {selectedRecipient}. ¡Envía el primer mensaje!
                      </p>
                    )}
                  </div>

                  {/* New message input */}
                  <div className="border-t pt-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Escribe tu mensaje para ${selectedRecipient}...`}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      data-testid="textarea-private-message"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={() => {
                          sendMessageMutation.mutate({
                            messageType: 'private',
                            content: newMessage,
                            senderName: currentUser,
                            recipientName: selectedRecipient
                          });
                        }}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-private-message"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar mensaje
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {!selectedRecipient && (
                <p className="text-neutral-500 text-center py-4">
                  Selecciona un usuario para empezar a chatear
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar fijo en desktop */}
      <div className="hidden lg:block">
        <SimpleSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          lowStockCount={lowStockItems.length}
          userName={(user as any)?.firstName || (user as any)?.email || 'Usuario'}
        />
      </div>
      
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <SimpleSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              lowStockCount={lowStockItems.length}
              userName={(user as any)?.firstName || (user as any)?.email || 'Usuario'}
            />
          </div>
        </>
      )}
      
      <main className="flex-1 lg:ml-0">
        {/* Botón hamburguesa para móvil */}
        <div className="lg:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <span className="font-bold text-neutral-800">Organización Familiar</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
            data-testid="button-open-sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'inicio') && renderDashboard()}
        </div>
        <div className={activeTab === 'activities' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'actividades') && renderActivitiesCalendar()}
        </div>
        <div className={activeTab === 'meal-calendar' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'calendario_comidas') && renderMealCalendar()}
        </div>
        <div className={activeTab === 'inventory' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'inventario') && renderInventory()}
        </div>
        <div className={activeTab === 'recipes' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'recetas') && renderRecipes()}
        </div>
        <div className={activeTab === 'shopping-list' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'lista_compra') && renderShoppingList()}
        </div>
        <div className={activeTab === 'messages' ? 'block' : 'hidden'}>
          {canAccessSection(userRole, 'mensajes') && renderMessages()}
        </div>
      </main>

      {showActivityModal && (
        <ActivityModal onClose={() => setShowActivityModal(false)} />
      )}
      {showMealModal && (
        <MealModal onClose={() => setShowMealModal(false)} />
      )}
      {showInventoryModal && (
        <InventoryModal onClose={() => setShowInventoryModal(false)} />
      )}
      {editingInventoryItem && (
        <InventoryEditModal 
          item={editingInventoryItem} 
          onClose={() => setEditingInventoryItem(null)} 
        />
      )}
      
      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
      />
      
      {editingRecipe && (
        <RecipeEditModal
          recipe={editingRecipe}
          isOpen={true}
          onClose={() => setEditingRecipe(null)}
        />
      )}
    </div>
  );
}

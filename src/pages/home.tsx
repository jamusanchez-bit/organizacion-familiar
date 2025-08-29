import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { getDailyQuote, getFormattedDate } from "@/utils/dailyQuotes";
import { getUserRole, getUserPermissions, canAccessSection, PURCHASE_CATEGORIES, type UserRole } from "@/utils/userPermissions";
import SimpleSidebar from "@/components/sidebar-simple";
import ActivityModal from "@/components/activity-modal";
import MealModal from "@/components/meal-modal";
import MealCalendarWeekly from "@/components/meal-calendar-weekly";
import ActivitiesCalendarImproved from "@/components/activities-calendar-improved";
import InventoryModal from "@/components/inventory-modal";
import InventoryEditModal from "@/components/inventory-edit-modal";
import InventoryQuantityModal from "@/components/inventory-quantity-modal";
import QuickStockUpdate from "@/components/quick-stock-update";
import RecipeModal from "@/components/recipe-modal";
import RecipeEditModal from "@/components/recipe-edit-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Package, AlertTriangle, Plus, Menu, Edit2, ChefHat, Clock, Users, Zap, Send, ShoppingCart, MessageSquare } from "lucide-react";
import MessagesSystem from "@/components/messages-system";
import ShoppingListEnhanced from "@/components/shopping-list-enhanced";
import UserSwitcher from "@/components/user-switcher";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Activity, Meal, InventoryItem, Recipe, RecipeIngredient, ShoppingListItem, Message } from "@shared/schema";

export default function Home() {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para manejar cambio de tab y cerrar sidebar móvil
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Cerrar sidebar móvil siempre que se cambie tab
  };

  // Listener para cerrar sidebar móvil con evento personalizado
  useEffect(() => {
    const handleCloseSidebar = () => {
      setSidebarOpen(false);
    };

    window.addEventListener('closeMobileSidebar', handleCloseSidebar);
    return () => {
      window.removeEventListener('closeMobileSidebar', handleCloseSidebar);
    };
  }, []);

  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const userNames = ['javier', 'raquel', 'mario', 'alba'];
  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser') || 'javier';
  const currentUser = selectedFamilyUser === 'javi_administrador' ? 'javier' : selectedFamilyUser;
  // Determinar el rol basado en el usuario seleccionado
  const userRole = (selectedFamilyUser === 'javi_administrador' ? 'javi_administrador' : selectedFamilyUser) as UserRole;
  const dailyQuote = getDailyQuote();
  const formattedDate = getFormattedDate();

  // Dashboard/Home Section
  const renderDashboard = () => {
    const todayActivities = activities?.filter(activity => 
      activity.date === format(new Date(), 'yyyy-MM-dd') && 
      activity.assignedTo === currentUser
    ) || [];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}! 👋
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90">{formattedDate}</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                <blockquote className="text-lg md:text-xl italic">
                  "{dailyQuote}"
                </blockquote>
                <p className="text-sm mt-2 opacity-75">— Joe Dispenza</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="card-stats-activities">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Actividades Hoy</p>
                      <p className="text-3xl font-bold text-gray-900">{todayActivities.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Calendar className="text-white h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="card-stats-meals">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Comidas Hoy</p>
                      <p className="text-3xl font-bold text-gray-900">{todayMeals.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                      <Utensils className="text-white h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="card-stats-inventory">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Items en Stock</p>
                      <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <Package className="text-white h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="card-stats-low-stock">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Stock Bajo</p>
                      <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                      <AlertTriangle className="text-white h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
                    onClick={() => handleTabChange('activities')}>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ver Actividades</h3>
                  <p className="opacity-90">Gestiona tu agenda diaria</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
                    onClick={() => handleTabChange('meal-calendar')}>
                <CardContent className="p-6 text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Planificar Comidas</h3>
                  <p className="opacity-90">Organiza el menú semanal</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
                    onClick={() => handleTabChange('inventory')}>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Revisar Inventario</h3>
                  <p className="opacity-90">Controla tu despensa</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActivitiesCalendar = () => {
    const permissions = getUserPermissions(userRole, 'actividades');
    
    return (
      <div className="p-6">
        <ActivitiesCalendarImproved 
          userRole={userRole}
          currentUser={currentUser}
          canAddActivities={permissions.canAddItems}
          canMarkCompleted={permissions.canMarkCompleted}
        />
      </div>
    );
  };

  const renderMealCalendar = () => {
    const permissions = getUserPermissions(userRole, 'calendario_comidas');
    
    return (
      <div className="p-6">
        <MealCalendarWeekly 
          userRole={userRole}
          canAddMeals={permissions.canAddItems}
        />
      </div>
    );
  };

  const renderInventory = () => {
    const permissions = getUserPermissions(userRole, 'inventario');
    
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-2">Inventario</h1>
              <p className="text-neutral-600">
                {permissions.canAddItems ? 'Gestiona tu stock de alimentos' : 'Consulta el stock disponible'}
              </p>
            </div>
            {permissions.canAddItems && (
              <div className="space-x-2">
                <Button 
                  onClick={() => setShowInventoryModal(true)}
                  data-testid="button-add-inventory-item"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Item
                </Button>
              </div>
            )}
          </div>

          {/* Agrupar productos por subcategoría */}
          {(() => {
            // Agrupar por subcategoría
            const groupedItems = inventory.reduce((groups, item) => {
              const subcategory = item.category || 'Sin categoría';
              if (!groups[subcategory]) {
                groups[subcategory] = [];
              }
              groups[subcategory].push(item);
              return groups;
            }, {} as Record<string, typeof inventory>);

            // Ordenar categorías alfabéticamente
            const sortedCategories = Object.keys(groupedItems).sort();

            return (
              <div className="space-y-6">
                {sortedCategories.map((subcategory) => (
                  <Card key={subcategory} className="border-neutral-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-neutral-800 mb-4 capitalize flex items-center">
                        <Package className="h-5 w-5 mr-2 text-neutral-600" />
                        {subcategory.replace(/_/g, ' ')} ({groupedItems[subcategory].length} productos)
                      </h3>
                      <div className="space-y-2">
                        {groupedItems[subcategory].map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                            onClick={() => setEditingInventoryItem(item)}
                            data-testid={`item-inventory-${item.id}`}
                            title="Click para ajustar cantidad"
                          >
                            <span className="font-medium text-neutral-800">{item.name}</span>
                            <span className="text-neutral-600 font-semibold">
                              {parseFloat(item.currentQuantity)} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
          
          {!permissions.canAddItems && (
            <div className="mt-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-blue-800 text-sm">
                    💡 Solo puedes modificar las cantidades de los items existentes. Para añadir nuevos items, contacta al administrador.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecipes = () => (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Recetas</h1>
            <p className="text-neutral-600">Administra tus recetas favoritas</p>
          </div>
          <Button 
            onClick={() => setShowRecipeModal(true)}
            data-testid="button-add-recipe"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Receta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="border-neutral-200" data-testid={`card-recipe-${recipe.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-neutral-800 mb-1">{recipe.name}</h3>
                    <p className="text-sm text-neutral-600 capitalize">{recipe.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRecipe(recipe)}
                    data-testid={`button-edit-recipe-${recipe.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShoppingList = () => {
    const permissions = getUserPermissions(userRole, 'lista_compra');
    
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <ShoppingListEnhanced 
            userRole={userRole}
            canAddItems={permissions.canAddItems}
          />
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    const permissions = getUserPermissions(userRole, 'mensajes');
    
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <MessagesSystem 
            userRole={userRole}
            currentUser={currentUser}
            canSendMessages={permissions.canSendMessages}
          />
        </div>
      </div>
    );
  };

  // Fetch data
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    enabled: isAuthenticated,
  });

  const { data: todayActivities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities', format(new Date(), 'yyyy-MM-dd')],
    enabled: isAuthenticated,
  });

  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
    enabled: isAuthenticated,
  });

  const { data: todayMeals = [] } = useQuery<Meal[]>({
    queryKey: ['/api/meals', format(new Date(), 'yyyy-MM-dd')],
    enabled: isAuthenticated,
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    enabled: isAuthenticated,
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory/low-stock'],
    enabled: isAuthenticated,
  });

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    enabled: isAuthenticated,
  });

  // Don't redirect automatically - let App.tsx handle routing

  // Loading states
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

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SimpleSidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
          lowStockCount={lowStockItems.length}
          userName={(user as any)?.firstName || (user as any)?.email || 'Usuario'}
        />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <SimpleSidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              lowStockCount={lowStockItems.length}
              userName={(user as any)?.firstName || (user as any)?.email || 'Usuario'}
            />
          </div>
        </>
      )}

      <main className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-2">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Organización Familiar</span>
          </div>
          <div className="flex items-center gap-2">
            <UserSwitcher currentUser={(user as any)?.id || (user as any)?.firstName?.toLowerCase()} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white hover:bg-slate-700"
              data-testid="button-open-sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
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

      {/* Modals */}
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
        getUserPermissions(userRole, 'inventario').canAddItems ? (
          <InventoryEditModal 
            item={editingInventoryItem} 
            onClose={() => setEditingInventoryItem(null)}
            userRole={userRole}
            canAddItems={getUserPermissions(userRole, 'inventario').canAddItems}
          />
        ) : (
          <InventoryQuantityModal
            item={editingInventoryItem}
            onClose={() => setEditingInventoryItem(null)}
          />
        )
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
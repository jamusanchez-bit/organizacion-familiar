import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDailyQuote, getFormattedDate } from "@/utils/dailyQuotes";
import { getUserRole, canAccessSection, type UserRole } from "@/utils/userPermissions";
import { 
  Home, 
  Calendar, 
  Utensils, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import ActivitiesCalendarImproved from "@/components/activities-calendar-improved";
import MealCalendarWeekly from "@/components/meal-calendar-weekly";
import MessagesSystem from "@/components/messages-system";
import ShoppingListEnhanced from "@/components/shopping-list-enhanced";
import InventorySection from "@/components/inventory-section";
import RecipesSection from "@/components/recipes-section-notion";

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'actividades', label: 'Actividades', icon: Calendar },
  { id: 'calendario_comidas', label: 'Calendario de Comidas', icon: Utensils },
  { id: 'recetas', label: 'Recetas', icon: ChefHat },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'lista_compra', label: 'Lista de Compra', icon: ShoppingCart },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('actividades');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser') || 'javier';
  const currentUser = selectedFamilyUser === 'javi_administrador' ? 'javier' : selectedFamilyUser;
  const userRole = (selectedFamilyUser === 'javi_administrador' ? 'javi_administrador' : selectedFamilyUser) as UserRole;
  
  const dailyQuote = getDailyQuote();
  const formattedDate = getFormattedDate();

  const availableMenuItems = MENU_ITEMS.filter(item => 
    canAccessSection(userRole, item.id as any)
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'actividades':
        return (
          <ActivitiesCalendarImproved 
            userRole={userRole}
            currentUser={currentUser}
            canAddActivities={userRole === 'javi_administrador'}
            canMarkCompleted={true}
          />
        );
      
      case 'calendario_comidas':
        return (
          <MealCalendarWeekly 
            userRole={userRole}
            canAddMeals={userRole === 'javi_administrador'}
          />
        );
      
      case 'recetas':
        return <RecipesSection userRole={userRole} />;
      
      case 'inventario':
        return <InventorySection userRole={userRole} />;
      
      case 'lista_compra':
        return (
          <ShoppingListEnhanced 
            userRole={userRole}
            canAddItems={userRole === 'javi_administrador'}
          />
        );
      
      case 'mensajes':
        return (
          <MessagesSystem 
            userRole={userRole}
            currentUser={currentUser}
            canSendMessages={true}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Estilo Notion */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-gray-600 text-sm">🏠</span>
            </div>
            <h2 className="text-sm font-medium text-gray-900">Organización Familiar</h2>
          </div>

        </div>
        
        {/* Navigation */}
        <nav className="mt-2 px-2">
          <div className="space-y-1">
            {availableMenuItems.filter(item => item.id !== 'inicio').map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-gray-700' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
            
            {/* Logout Button */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
                onClick={() => {
                  localStorage.removeItem('selectedFamilyUser');
                  window.location.href = '/';
                }}
              >
                <span className="h-4 w-4 mr-3">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-xs">
                {currentUser.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 capitalize">
                {currentUser}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === 'javi_administrador' ? 'Admin' : 'Usuario'}
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header - Estilo Notion */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-6">

            
            {/* Header content - minimalista como Notion */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}!
              </h1>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            
            <div className="w-10" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
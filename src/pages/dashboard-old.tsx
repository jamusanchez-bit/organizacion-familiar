import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDailyQuote, getFormattedDate } from "@/utils/dailyQuotes";
import { getUserRole, canAccessSection, type UserRole } from "@/utils/userPermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import RecipesSection from "@/components/recipes-section";

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: Home, color: 'text-blue-600' },
  { id: 'actividades', label: 'Actividades', icon: Calendar, color: 'text-green-600' },
  { id: 'calendario_comidas', label: 'Calendario de Comidas', icon: Utensils, color: 'text-orange-600' },
  { id: 'recetas', label: 'Recetas', icon: ChefHat, color: 'text-red-600' },
  { id: 'inventario', label: 'Inventario', icon: Package, color: 'text-purple-600' },
  { id: 'lista_compra', label: 'Lista de Compra', icon: ShoppingCart, color: 'text-pink-600' },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, color: 'text-indigo-600' },
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
      case 'inicio':
        return (
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}! 👋
              </h1>
              <p className="text-xl text-gray-700 mb-6">{formattedDate}</p>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 max-w-2xl mx-auto">
                <blockquote className="text-lg italic text-gray-800">
                  "{dailyQuote}"
                </blockquote>
              </div>
            </div>
            <ActivitiesCalendarImproved 
              userRole={userRole}
              currentUser={currentUser}
              canAddActivities={userRole === 'javi_administrador'}
              canMarkCompleted={true}
            />
          </div>
        );
      
      case 'actividades':
        return (
          <div className="p-6">
            <ActivitiesCalendarImproved 
              userRole={userRole}
              currentUser={currentUser}
              canAddActivities={userRole === 'javi_administrador'}
              canMarkCompleted={true}
            />
          </div>
        );
      
      case 'calendario_comidas':
        return (
          <div className="p-6">
            <MealCalendarWeekly 
              userRole={userRole}
              canAddMeals={userRole === 'javi_administrador'}
            />
          </div>
        );
      
      case 'recetas':
        return (
          <div className="p-6">
            <RecipesSection userRole={userRole} />
          </div>
        );
      
      case 'inventario':
        return (
          <div className="p-6">
            <InventorySection userRole={userRole} />
          </div>
        );
      
      case 'lista_compra':
        return (
          <div className="p-6">
            <ShoppingListEnhanced 
              userRole={userRole}
              canAddItems={userRole === 'javi_administrador'}
            />
          </div>
        );
      
      case 'mensajes':
        return (
          <div className="p-6">
            <MessagesSystem 
              userRole={userRole}
              currentUser={currentUser}
              canSendMessages={true}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex" style={{backgroundColor: 'white !important'}}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-500 ease-out backdrop-blur-sm ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-20 px-6" style={{backgroundColor: 'red'}}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">🏠</span>
            </div>
            <h2 className="text-xl font-bold text-white">Familia</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {availableMenuItems.filter(item => item.id !== 'inicio').map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-14 text-left transition-all duration-300 transform hover:scale-105 rounded-2xl ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white shadow-2xl shadow-purple-200 border-0' 
                      : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-gray-700 hover:text-purple-700 hover:shadow-lg'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                    isActive ? 'bg-white/20' : 'bg-gradient-to-r from-purple-100 to-blue-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </Button>
              );
            })}
            
            {/* Logout Button */}
            <div className="pt-6 border-t border-purple-200">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  localStorage.removeItem('selectedFamilyUser');
                  window.location.href = '/';
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center mr-4">
                  <span className="text-xl">🚪</span>
                </div>
                <span className="font-semibold">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </nav>
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {currentUser}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === 'javi_administrador' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header with hamburger menu */}
        <div className="bg-gradient-to-r from-white via-purple-50 to-blue-50 shadow-xl border-b border-purple-100 backdrop-blur-sm">
          <div className="flex items-center justify-between h-24 px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-pulse">
                ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}! 👋
              </h1>
              <p className="text-xl text-gray-700 font-medium mb-3">{formattedDate}</p>
              <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-2xl p-6 mt-3 max-w-3xl mx-auto shadow-lg border border-purple-200">
                <blockquote className="text-lg italic text-gray-800 font-medium leading-relaxed">
                  "{dailyQuote}"
                </blockquote>
              </div>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
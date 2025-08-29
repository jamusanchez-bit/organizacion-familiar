import { Button } from "@/components/ui/button";
import { Calendar, Home, Utensils, Package, LogOut, ChefHat, X, ShoppingCart, MessageSquare } from "lucide-react";
import { getUserRole, canAccessSection, type UserRole } from "@/utils/userPermissions";
import { useAuth } from "@/hooks/useAuth";
import UserSwitcher from "@/components/user-switcher";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  userName: string;
}

export default function SimpleSidebar({ activeTab, setActiveTab, lowStockCount, userName }: SidebarProps) {
  const { user } = useAuth();
  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser') || 'javier';
  const userRole = (selectedFamilyUser === 'javi_administrador' ? 'javi_administrador' : selectedFamilyUser) as UserRole;
  
  const handleLogout = async () => {
    try {
      // Limpiar el usuario seleccionado al cerrar sesión
      localStorage.removeItem('selectedFamilyUser');
      
      // Hacer logout en el servidor
      await fetch('/api/simple-auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Redirigir a la página de inicio
      window.location.href = "/";
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar redirección incluso si hay error
      window.location.href = "/";
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab); // Esta función ya maneja el cierre del sidebar móvil en el componente padre
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, section: 'inicio' },
    { id: 'activities', label: 'Actividades', icon: Calendar, section: 'actividades' },
    { id: 'meal-calendar', label: 'Calendario de comidas', icon: Utensils, section: 'calendario_comidas' },
    { id: 'recipes', label: 'Recetas', icon: ChefHat, section: 'recetas' },
    { 
      id: 'inventory', 
      label: 'Inventario', 
      icon: Package,
      section: 'inventario',
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    { id: 'shopping-list', label: 'Lista de la compra', icon: ShoppingCart, section: 'lista_compra' },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare, section: 'mensajes' }
  ].filter(item => canAccessSection(userRole, item.section as any));

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl h-full flex flex-col relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 lg:flex lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3">
              <Calendar className="text-white h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Organización Familiar
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-2 ml-11">Hola, {userName} 👋</p>
        </div>
        {/* Botón cerrar para móvil */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Emitir evento personalizado para cerrar sidebar desde el componente padre
            const closeEvent = new CustomEvent('closeMobileSidebar');
            window.dispatchEvent(closeEvent);
          }}
          className="lg:hidden absolute top-4 right-4 p-1"
          data-testid="button-close-sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 h-auto rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white font-medium shadow-lg backdrop-blur-sm' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                  }`}
                  onClick={() => handleTabChange(item.id)}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full shadow-lg" data-testid="badge-low-stock">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Switcher & Logout */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        <div className="mb-3">
          <UserSwitcher currentUser={(user as any)?.id || (user as any)?.firstName?.toLowerCase()} />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 text-slate-300 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
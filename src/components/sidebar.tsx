import { Button } from "@/components/ui/button";
import { Calendar, Home, Utensils, Package, LogOut, X, ChefHat, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, lowStockCount, userName, isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onClose(); // Cerrar sidebar en móvil después de seleccionar
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'activities', label: 'Actividades', icon: Calendar },
    { id: 'meals', label: 'Calendario de comidas', icon: Utensils },
    { id: 'recipes', label: 'Recetas', icon: ChefHat },
    { id: 'inventory', label: 'Inventario', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-neutral-200 fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-10 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
              <h1 className="text-xl font-bold text-neutral-800">
                <Calendar className="inline text-primary mr-2 h-6 w-6" />
                CalendApp
              </h1>
              <p className="text-sm text-neutral-500 mt-1">Bienvenido, {userName}</p>
            </div>
            {isCollapsed && (
              <div className="w-full flex justify-center">
                <Calendar className="text-primary h-6 w-6" />
              </div>
            )}
            <div className="flex gap-1">
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1"
                  data-testid="button-toggle-sidebar"
                  title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden p-1"
                data-testid="button-close-sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} py-3 h-auto relative ${
                    isActive 
                      ? 'bg-primary/10 border-r-2 border-primary text-neutral-700 font-medium' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  onClick={() => handleTabChange(item.id)}
                  data-testid={`nav-${item.id}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  {!isCollapsed && (
                    <>
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full" data-testid="badge-low-stock">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="badge-low-stock">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} py-3 text-neutral-600 hover:bg-neutral-100`}
            onClick={handleLogout}
            data-testid="button-logout"
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && 'Cerrar Sesión'}
          </Button>
        </div>
      </aside>
    </>
  );
}

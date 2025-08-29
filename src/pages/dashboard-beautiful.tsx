import { useState } from "react";
import { Calendar, ChefHat, Package, ShoppingCart, MessageSquare, Utensils, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RecipesSection from "@/components/recipes-section";
import InventorySection from "@/components/inventory-section";
import { getUserRole } from "@/utils/userPermissions";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('actividades');
  const { logout } = useAuth();
  
  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser') || 'javier';
  const currentUser = selectedFamilyUser === 'javi_administrador' ? 'javier' : selectedFamilyUser;
  const userRole = getUserRole(selectedFamilyUser);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white flex" style={{display: 'flex', minHeight: '100vh', backgroundColor: 'white'}}>
      {/* Sidebar estilo Notion mejorado */}
      <div className="w-64 bg-gray-50 border-r border-gray-200" style={{width: '256px', backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb'}}>
        {/* Header mejorado */}
        <div className="h-12 px-4 flex items-center" style={{height: '48px', padding: '0 16px'}}>
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">🏠</span>
            </div>

          </div>
        </div>
        
        {/* Menu mejorado */}
        <nav className="mt-4 px-3" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveSection('actividades')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'actividades' ? '#10b981' : 'transparent',
                color: activeSection === 'actividades' ? 'white' : '#374151',
                boxShadow: activeSection === 'actividades' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <Calendar className={`h-5 w-5 mr-3 ${
                activeSection === 'actividades' ? 'text-white' : 'text-gray-500'
              }`} />
              Actividades
            </button>
            
            <button 
              onClick={() => setActiveSection('comidas')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'comidas' ? '#3b82f6' : 'transparent',
                color: activeSection === 'comidas' ? 'white' : '#374151',
                boxShadow: activeSection === 'comidas' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <Utensils className={`h-5 w-5 mr-3 ${
                activeSection === 'comidas' ? 'text-white' : 'text-gray-500'
              }`} />
              Comidas
            </button>
            
            <button 
              onClick={() => setActiveSection('recetas')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'recetas' ? '#059669' : 'transparent',
                color: activeSection === 'recetas' ? 'white' : '#374151',
                boxShadow: activeSection === 'recetas' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <ChefHat className={`h-5 w-5 mr-3 ${
                activeSection === 'recetas' ? 'text-white' : 'text-gray-500'
              }`} />
              Recetas
            </button>
            
            <button 
              onClick={() => setActiveSection('inventario')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'inventario' ? '#2563eb' : 'transparent',
                color: activeSection === 'inventario' ? 'white' : '#374151',
                boxShadow: activeSection === 'inventario' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <Package className={`h-5 w-5 mr-3 ${
                activeSection === 'inventario' ? 'text-white' : 'text-gray-500'
              }`} />
              Inventario
            </button>
            
            <button 
              onClick={() => setActiveSection('compras')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'compras' ? '#10b981' : 'transparent',
                color: activeSection === 'compras' ? 'white' : '#374151',
                boxShadow: activeSection === 'compras' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <ShoppingCart className={`h-5 w-5 mr-3 ${
                activeSection === 'compras' ? 'text-white' : 'text-gray-500'
              }`} />
              Lista de Compra
            </button>
            
            <button 
              onClick={() => setActiveSection('mensajes')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-2"
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif', 
                display: 'block', 
                width: '100%', 
                marginBottom: '8px',
                backgroundColor: activeSection === 'mensajes' ? '#3b82f6' : 'transparent',
                color: activeSection === 'mensajes' ? 'white' : '#374151',
                boxShadow: activeSection === 'mensajes' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <MessageSquare className={`h-5 w-5 mr-3 ${
                activeSection === 'mensajes' ? 'text-white' : 'text-gray-500'
              }`} />
              Mensajes
            </button>
          </div>
        </nav>
        
        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200" style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', borderTop: '1px solid #e5e7eb'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs font-medium text-gray-900" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>
                  {currentUser === 'javier' ? 'Javier' : 
                   currentUser === 'raquel' ? 'Raquel' : 
                   currentUser === 'mario' ? 'Mario' : 
                   currentUser === 'alba' ? 'Alba' : 
                   currentUser === 'javi_administrador' ? 'Javi (Admin)' : currentUser}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('selectedFamilyUser');
                fetch('/api/simple-auth/logout', { method: 'POST' })
                  .finally(() => {
                    window.location.reload();
                  });
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content mejorado */}
      <div className="flex-1" style={{flex: 1}}>
        {/* Header mejorado */}
        <div className="h-16 px-8 border-b border-gray-100 flex items-center bg-white" style={{height: '64px', padding: '0 32px', borderBottom: '1px solid #f3f4f6', backgroundColor: 'white'}}>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>
              ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}! 👋
            </h1>
            <p className="text-sm text-gray-500" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Bienvenido a tu organización familiar</p>
          </div>
        </div>

        {/* Content mejorado */}
        <main className="p-8 bg-gray-50" style={{padding: '32px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)'}}>
          <div className="max-w-6xl mx-auto">
            {/* Full width for functional sections */}
            {['recetas', 'inventario'].includes(activeSection) ? (
              <div>
                {/* Dynamic Content */}
                {activeSection === 'recetas' && <RecipesSection userRole={userRole} />}
                {activeSection === 'inventario' && <InventorySection userRole={userRole} />}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" style={{backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}}>
              {/* Only show header for non-functional sections */}
              {!['recetas', 'inventario'].includes(activeSection) && (
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    activeSection === 'actividades' ? 'bg-green-100' :
                    activeSection === 'comidas' ? 'bg-blue-100' :
                    activeSection === 'compras' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {activeSection === 'actividades' && <Calendar className="h-5 w-5 text-green-600" />}
                    {activeSection === 'comidas' && <Utensils className="h-5 w-5 text-blue-600" />}
                    {activeSection === 'compras' && <ShoppingCart className="h-5 w-5 text-green-600" />}
                    {activeSection === 'mensajes' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>
                      {activeSection === 'actividades' && 'Actividades'}
                      {activeSection === 'comidas' && 'Calendario de Comidas'}
                      {activeSection === 'compras' && 'Lista de Compra'}
                      {activeSection === 'mensajes' && 'Mensajes'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>
                      Gestiona tu {activeSection} familiar
                    </p>
                  </div>
                </div>
              )}
              
              {/* Dynamic Content */}
              {activeSection === 'recetas' && <RecipesSection userRole={userRole} />}
              {activeSection === 'inventario' && <InventorySection userRole={userRole} />}
              
              {/* Placeholder for other sections */}
              {!['recetas', 'inventario'].includes(activeSection) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Próximamente</h3>
                    <p className="text-gray-600 text-sm" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Esta sección estará disponible pronto</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>En desarrollo</h3>
                    <p className="text-gray-600 text-sm" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Funcionalidad en construcción</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Datos reales</h3>
                    <p className="text-gray-600 text-sm" style={{fontFamily: 'Verdana, Geneva, sans-serif'}}>Usa las secciones Recetas e Inventario para ver tus datos de Replit</p>
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
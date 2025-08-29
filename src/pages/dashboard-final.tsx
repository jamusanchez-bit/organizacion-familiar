import { useState } from "react";
import { Calendar, ChefHat, Package, ShoppingCart, MessageSquare, Utensils } from "lucide-react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('actividades');
  
  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser') || 'javier';
  const currentUser = selectedFamilyUser === 'javi_administrador' ? 'javier' : selectedFamilyUser;

  return (
    <div className="min-h-screen bg-white flex" style={{display: 'flex', minHeight: '100vh', backgroundColor: 'white'}}>
      {/* Sidebar estilo Notion */}
      <div className="w-64 bg-gray-50 border-r border-gray-200" style={{width: '256px', backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb'}}>
        {/* Header */}
        <div className="h-14 px-4 border-b border-gray-200 flex items-center" style={{height: '56px', padding: '0 16px', borderBottom: '1px solid #e5e7eb'}}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-600 text-sm">🏠</span>
            </div>
            <h2 className="text-sm font-medium text-gray-900">Organización Familiar</h2>
          </div>
        </div>
        
        {/* Menu */}
        <nav className="mt-2 px-2">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveSection('actividades')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'actividades' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Actividades
            </button>
            
            <button 
              onClick={() => setActiveSection('comidas')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'comidas' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Utensils className="h-4 w-4 mr-3" />
              Comidas
            </button>
            
            <button 
              onClick={() => setActiveSection('recetas')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'recetas' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChefHat className="h-4 w-4 mr-3" />
              Recetas
            </button>
            
            <button 
              onClick={() => setActiveSection('inventario')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'inventario' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="h-4 w-4 mr-3" />
              Inventario
            </button>
            
            <button 
              onClick={() => setActiveSection('compras')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'compras' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-3" />
              Lista de Compra
            </button>
            
            <button 
              onClick={() => setActiveSection('mensajes')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeSection === 'mensajes' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-3" />
              Mensajes
            </button>
          </div>
        </nav>
        
        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200" style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', borderTop: '1px solid #e5e7eb'}}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-xs">
                {currentUser.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 capitalize">{currentUser}</p>
              <p className="text-xs text-gray-500">Usuario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1" style={{flex: 1}}>
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-200 flex items-center" style={{height: '56px', padding: '0 24px', borderBottom: '1px solid #e5e7eb'}}>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              ¡Hola, {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}!
            </h1>
          </div>
        </div>

        {/* Content */}
        <main className="p-6" style={{padding: '24px'}}>
          <div className="bg-white border border-gray-200 rounded-lg p-6" style={{backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px'}}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {activeSection === 'actividades' && '📅 Actividades'}
              {activeSection === 'comidas' && '🍽️ Calendario de Comidas'}
              {activeSection === 'recetas' && '🍳 Recetas'}
              {activeSection === 'inventario' && '📦 Inventario'}
              {activeSection === 'compras' && '🛒 Lista de Compra'}
              {activeSection === 'mensajes' && '💬 Mensajes'}
            </h2>
            <p className="text-gray-600">
              Contenido de {activeSection} - Aquí irían los componentes reales
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
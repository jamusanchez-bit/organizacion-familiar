export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white flex" style={{backgroundColor: 'white', display: 'flex'}}>
      {/* Sidebar FORZADO */}
      <div className="w-64 bg-gray-50 border-r border-gray-200" style={{width: '256px', backgroundColor: '#f9fafb', minHeight: '100vh'}}>
        <div className="p-4" style={{padding: '16px'}}>
          <h1 className="text-gray-800 font-semibold text-sm" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>⌂ Organización Familiar</h1>
        </div>
        <nav className="px-2">
          <div className="bg-gray-200 text-gray-900 px-3 py-1.5 mx-1 my-0.5 rounded text-sm" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">■</span>Actividades
          </div>
          <div className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 mx-1 my-0.5 rounded text-sm cursor-pointer" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">○</span>Comidas  
          </div>
          <div className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 mx-1 my-0.5 rounded text-sm cursor-pointer" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">△</span>Recetas
          </div>
          <div className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 mx-1 my-0.5 rounded text-sm cursor-pointer" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">□</span>Inventario
          </div>
          <div className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 mx-1 my-0.5 rounded text-sm cursor-pointer" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">◇</span>Lista de Compra
          </div>
          <div className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 mx-1 my-0.5 rounded text-sm cursor-pointer" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="mr-2">●</span>Mensajes
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-white" style={{backgroundColor: 'white', flex: 1}}>
        <div className="p-6" style={{padding: '24px'}}>
          <h1 className="text-gray-900 text-2xl font-semibold mb-1" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>■ Actividades</h1>
          <p className="text-gray-500 text-sm mb-6" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>Gestiona las actividades familiares</p>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded border">
                <span className="mr-3 text-green-600">✓</span>
                <span className="text-gray-700" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>Ejemplo de actividad completada</span>
              </div>
              <div className="flex items-center p-3 bg-white rounded border">
                <span className="mr-3 text-gray-400">○</span>
                <span className="text-gray-700" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>Ejemplo de actividad pendiente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
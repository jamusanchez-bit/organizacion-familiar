export default function TestNotion() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar estilo Notion */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-900">🏠 Organización Familiar</h1>
        </div>
        <nav className="px-2">
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-md">
              📅 Actividades
            </div>
            <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
              🍽️ Comidas
            </div>
            <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
              🍳 Recetas
            </div>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">✅ ¡Diseño Notion funcionando!</h1>
          <p className="text-gray-600">Si ves esto, el diseño estilo Notion está cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
}
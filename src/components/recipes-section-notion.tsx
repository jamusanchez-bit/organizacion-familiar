import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Clock, Users, Search, Utensils, Eye, Edit2, Trash2 } from "lucide-react";
import { RECIPE_CATEGORIES } from "@/utils/userPermissions";
import type { Recipe } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface RecipesSectionProps {
  userRole: UserRole;
}

export default function RecipesSection({ userRole }: RecipesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    staleTime: 30000,
  });

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.instructions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(recipes.map(recipe => recipe.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Estilo Notion */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🍳 Recetas</h1>
        <p className="text-gray-500 text-sm">Gestiona tus recetas favoritas</p>
      </div>

      {/* Search and Filters - Estilo Notion */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipes Grid - Estilo Notion */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No se encontraron recetas' : 'No hay recetas disponibles'}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'Las recetas se cargarán automáticamente cuando estén disponibles'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="relative">
                <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-200">
                  <ChefHat className="h-8 w-8 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {recipe.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.name}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.prepTime || 30} min</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.instructions}
                </p>
                
                <div className="flex justify-between items-center">
                  <button 
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </button>
                  
                  {userRole === 'javi_administrador' && (
                    <div className="flex gap-1">
                      <button 
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Panel - Estilo Notion */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">ℹ</span>
          </div>
          <div className="text-blue-900 text-sm">
            <p className="font-medium mb-1">Sobre las recetas</p>
            <p>Las recetas están organizadas por categorías y vinculadas con el inventario para control automático de ingredientes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
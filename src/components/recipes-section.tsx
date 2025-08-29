import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, Clock, Users, Search, Utensils } from "lucide-react";
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
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      comidas: 'bg-orange-100 text-orange-800 border-orange-200',
      cenas: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category: string) => {
    return category === 'comidas' ? '🍽️' : '🌙';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Recetas
        </h2>
        <p className="text-gray-600 text-lg">
          Descubre deliciosas recetas para toda la familia
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-orange-500"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-gradient-to-r from-red-500 to-orange-500' : ''}
          >
            Todas
          </Button>
          {RECIPE_CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? 'bg-gradient-to-r from-red-500 to-orange-500' : ''}
            >
              {getCategoryIcon(category.value)} {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No se encontraron recetas' : 'No hay recetas disponibles'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Las recetas se cargarán automáticamente cuando estén disponibles'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={`${getCategoryColor(recipe.category)} font-medium`}
                  >
                    {getCategoryIcon(recipe.category)} {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                  {recipe.name}
                </CardTitle>
                {recipe.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Recipe Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {recipe.preparationTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>{recipe.preparationTime} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{recipe.servings} personas</span>
                      </div>
                    )}
                  </div>

                  {/* Crockpot Function */}
                  {recipe.crockpotFunction && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      🍲 Crockpot: {recipe.crockpotFunction}
                    </Badge>
                  )}

                  {/* Instructions Preview */}
                  {recipe.instructions && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {recipe.instructions}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Ver Receta Completa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Panel */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <ChefHat className="h-6 w-6 text-red-600 mt-1" />
            <div className="text-red-800">
              <p className="font-medium mb-2">🍳 Sobre las recetas:</p>
              <ul className="space-y-1 text-sm">
                <li>• 🍽️ <strong>Comidas:</strong> Recetas para el almuerzo y comida principal</li>
                <li>• 🌙 <strong>Cenas:</strong> Recetas ligeras para la noche</li>
                <li>• ⏱️ Tiempo de preparación incluido para planificar mejor</li>
                <li>• 👥 Porciones calculadas para 4 personas por defecto</li>
                <li>• 🔗 Las recetas están vinculadas con el inventario para control automático</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
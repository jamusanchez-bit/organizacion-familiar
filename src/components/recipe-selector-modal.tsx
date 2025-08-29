import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, ChefHat } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType: string;
}

export default function RecipeSelectorModal({ 
  isOpen, 
  onClose, 
  onSelectRecipe, 
  mealType 
}: RecipeSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    enabled: isOpen,
  });

  // Filter recipes based on meal type and search term
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by meal type category
    const matchesMealType = mealType.includes('comida') || mealType.includes('cena') 
      ? recipe.category === (mealType.includes('comida') ? 'comidas' : 'cenas')
      : true; // For breakfast and snacks, show all recipes
    
    return matchesSearch && matchesMealType;
  });

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Seleccionar Receta
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Recipes Grid */}
          <div className="overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron recetas</p>
                {searchTerm && (
                  <p className="text-sm">Intenta con otros términos de búsqueda</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <Card 
                    key={recipe.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {recipe.name}
                          </h3>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {recipe.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {recipe.category}
                          </Badge>
                          
                          {recipe.preparationTime && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {recipe.preparationTime} min
                            </Badge>
                          )}
                          
                          {recipe.servings && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {recipe.servings} personas
                            </Badge>
                          )}
                        </div>

                        {recipe.crockpotFunction && (
                          <Badge variant="secondary" className="text-xs">
                            Crockpot: {recipe.crockpotFunction}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
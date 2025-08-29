import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertRecipeSchema, type InsertRecipe, type InventoryItem } from "@shared/schema";
import { z } from "zod";
import { Plus, X, ChefHat } from "lucide-react";

const recipeFormSchema = insertRecipeSchema.extend({
  preparationTime: z.number().min(0.1, "El tiempo debe ser mayor a 0").optional(),
  servings: z.number().min(1, "Las porciones deben ser mayor a 0").optional(),
  crockpotFunction: z.enum(["alta", "baja", "none"]).optional(),
}).omit({ description: true });

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedIngredient {
  inventoryItemId: string;
  inventoryItem: InventoryItem;
  quantity: number;
  unit: string;
}

export default function RecipeModal({ isOpen, onClose }: RecipeModalProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      category: "desayunos",
      instructions: "",
      preparationTime: undefined,
      crockpotFunction: undefined,
      servings: 4,
    },
  });

  // Fetch inventory for ingredients selection
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (data: { recipe: InsertRecipe; ingredients: Omit<SelectedIngredient, 'inventoryItem'>[] }) => {
      // Create recipe first
      const recipeResponse = await apiRequest('POST', '/api/recipes', data.recipe);
      const recipe = await recipeResponse.json();

      // Then add ingredients
      for (const ingredient of data.ingredients) {
        await apiRequest('POST', `/api/recipes/${recipe.id}/ingredients`, {
          inventoryItemId: ingredient.inventoryItemId,
          quantity: ingredient.quantity.toString(),
          unit: ingredient.unit,
        });
      }

      return recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Receta creada",
        description: "La receta se ha guardado exitosamente",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la receta",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedIngredients([]);
    onClose();
  };

  const addIngredient = (inventoryItemId: string) => {
    const inventoryItem = inventory.find(item => item.id === inventoryItemId);
    if (!inventoryItem) return;

    if (selectedIngredients.some(ing => ing.inventoryItemId === inventoryItemId)) {
      toast({
        title: "Ingrediente duplicado",
        description: "Este ingrediente ya está en la receta",
        variant: "destructive",
      });
      return;
    }

    setSelectedIngredients(prev => [...prev, {
      inventoryItemId,
      inventoryItem,
      quantity: 1,
      unit: inventoryItem.unit,
    }]);
  };

  const updateIngredientQuantity = (inventoryItemId: string, quantity: number) => {
    setSelectedIngredients(prev => 
      prev.map(ing => 
        ing.inventoryItemId === inventoryItemId 
          ? { ...ing, quantity } 
          : ing
      )
    );
  };

  const removeIngredient = (inventoryItemId: string) => {
    setSelectedIngredients(prev => 
      prev.filter(ing => ing.inventoryItemId !== inventoryItemId)
    );
  };

  const onSubmit = (data: RecipeFormData) => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "Ingredientes requeridos",
        description: "Debes agregar al menos un ingrediente",
        variant: "destructive",
      });
      return;
    }

    const recipeData: InsertRecipe = {
      name: data.name,
      description: undefined,
      category: data.category,
      instructions: data.instructions || undefined,
      preparationTime: data.preparationTime ? Math.round(data.preparationTime * 60) : undefined, // Convert hours to minutes for storage
      crockpotFunction: data.crockpotFunction || undefined,
      servings: data.servings || 4,
    };

    const ingredientsData = selectedIngredients.map(ing => ({
      inventoryItemId: ing.inventoryItemId,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    createRecipeMutation.mutate({
      recipe: recipeData,
      ingredients: ingredientsData,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="recipe-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ChefHat className="mr-2 h-5 w-5" />
            Agregar Nueva Receta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Recipe Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la receta *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Ej: Pasta con tomate"
                data-testid="input-recipe-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value as any)}
              >
                <SelectTrigger data-testid="select-recipe-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayunos">Desayunos</SelectItem>
                  <SelectItem value="almuerzos">Almuerzos</SelectItem>
                  <SelectItem value="comidas">Comidas</SelectItem>
                  <SelectItem value="meriendas">Meriendas</SelectItem>
                  <SelectItem value="cenas">Cenas</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preparationTime">Tiempo (horas)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...form.register("preparationTime", { 
                    setValueAs: (value) => value === "" ? undefined : parseFloat(value) 
                  })}
                  placeholder="0.5"
                  data-testid="input-recipe-time"
                />
              </div>
              <div>
                <Label htmlFor="crockpotFunction">Función Crockpot</Label>
                <Select
                  value={form.watch("crockpotFunction") || "none"}
                  onValueChange={(value) => form.setValue("crockpotFunction", value === "none" ? undefined : value as "alta" | "baja")}
                >
                  <SelectTrigger data-testid="select-crockpot-function">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="servings">Porciones</Label>
                <Input
                  id="servings"
                  type="number"
                  {...form.register("servings", { 
                    setValueAs: (value) => value === "" ? 1 : parseInt(value) 
                  })}
                  placeholder="4"
                  data-testid="input-recipe-servings"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instrucciones</Label>
              <Textarea
                id="instructions"
                {...form.register("instructions")}
                placeholder="1. Paso uno...&#10;2. Paso dos..."
                rows={4}
                data-testid="textarea-recipe-instructions"
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ingredientes</h3>
              <Select onValueChange={addIngredient}>
                <SelectTrigger className="w-64" data-testid="select-add-ingredient">
                  <SelectValue placeholder="Agregar ingrediente del inventario" />
                </SelectTrigger>
                <SelectContent>
                  {inventory
                    .filter(item => !selectedIngredients.some(ing => ing.inventoryItemId === item.id))
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.currentQuantity} {item.unit})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {selectedIngredients.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-neutral-500">No has agregado ingredientes</p>
                  <p className="text-sm text-neutral-400">Selecciona ingredientes de tu inventario</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {selectedIngredients.map((ingredient) => (
                  <Card key={ingredient.inventoryItemId} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{ingredient.inventoryItem.name}</p>
                        <p className="text-sm text-neutral-500 capitalize">{ingredient.inventoryItem.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredientQuantity(ingredient.inventoryItemId, parseFloat(e.target.value) || 1)}
                          className="w-20"
                          data-testid={`input-ingredient-quantity-${ingredient.inventoryItemId}`}
                        />
                        <span className="text-sm text-neutral-600 w-12">{ingredient.unit}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ingredient.inventoryItemId)}
                          data-testid={`button-remove-ingredient-${ingredient.inventoryItemId}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              data-testid="button-cancel-recipe"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createRecipeMutation.isPending}
              className="bg-secondary hover:bg-secondary/90"
              data-testid="button-save-recipe"
            >
              {createRecipeMutation.isPending ? "Guardando..." : "Guardar Receta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
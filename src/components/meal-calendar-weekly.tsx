import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check, Edit2, Save, X, ChefHat, Utensils } from "lucide-react";
import { format, addWeeks, startOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RecipeSelectorModal from "@/components/recipe-selector-modal";
import type { Meal, Recipe } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface MealCalendarWeeklyProps {
  userRole: UserRole;
  canAddMeals: boolean;
}

// Definir las filas de comidas según especificaciones
const MEAL_ROWS = [
  { id: 'desayuno_alba_mario', label: 'Desayuno Alba y Mario' },
  { id: 'desayuno_raquel_javier', label: 'Desayuno Raquel y Javier' },
  { id: 'almuerzo_alba_mario', label: 'Almuerzo Alba y Mario' },
  { id: 'almuerzo_raquel_javier', label: 'Almuerzo Raquel y Javier' },
  { id: 'comida', label: 'Comida' },
  { id: 'merienda_alba_mario', label: 'Merienda Alba y Mario' },
  { id: 'merienda_raquel_javier', label: 'Merienda Raquel y Javier' },
  { id: 'cena', label: 'Cena' },
];

const DAYS_OF_WEEK = [
  { id: 0, label: 'Lunes' },
  { id: 1, label: 'Martes' },
  { id: 2, label: 'Miércoles' },
  { id: 3, label: 'Jueves' },
  { id: 4, label: 'Viernes' },
  { id: 5, label: 'Sábado' },
  { id: 6, label: 'Domingo' },
];

export default function MealCalendarWeekly({ userRole, canAddMeals }: MealCalendarWeeklyProps) {
  // Empezar desde la primera semana de septiembre 2024
  const [currentWeek, setCurrentWeek] = useState(() => {
    const septemberFirst = new Date(2024, 8, 1); // 1 de septiembre 2024
    return startOfWeek(septemberFirst, { weekStartsOn: 1 });
  });
  
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const weekStart = format(currentWeek, 'yyyy-MM-dd');
  
  // Fetch meals for current week
  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meal-plan', weekStart],
    staleTime: 30000,
  });

  // Create or update meal
  const saveMealMutation = useMutation({
    mutationFn: async ({ mealType, dayOfWeek, content, recipeId }: { 
      mealType: string; 
      dayOfWeek: number; 
      content: string;
      recipeId?: string;
    }) => {
      const existingMeal = meals.find(m => m.mealType === mealType && m.dayOfWeek === dayOfWeek);
      
      const mealData = {
        content,
        recipeId: recipeId || null
      };
      
      if (existingMeal) {
        const response = await apiRequest("PUT", `/api/meal-plan/${existingMeal.id}`, mealData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/meal-plan", {
          weekStart,
          dayOfWeek,
          mealType,
          ...mealData,
          isCompleted: false
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan', weekStart] });
      setEditingCell(null);
      setEditValue('');
      toast({
        title: "Comida guardada",
        description: "La planificación se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la comida.",
        variant: "destructive",
      });
    },
  });

  // Toggle meal completion
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await apiRequest("PUT", `/api/meal-plan/${id}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan', weekStart] });
      toast({
        title: "Comida marcada",
        description: "La comida se ha marcado como completada.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar la comida.",
        variant: "destructive",
      });
    },
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const handleCellClick = (mealType: string, dayOfWeek: number) => {
    if (!canAddMeals) return;
    
    const cellId = `${mealType}-${dayOfWeek}`;
    const existingMeal = meals.find(m => m.mealType === mealType && m.dayOfWeek === dayOfWeek);
    
    setEditingCell(cellId);
    setEditValue(existingMeal?.content || '');
  };

  const handleSelectRecipe = (mealType: string, dayOfWeek: number) => {
    if (!canAddMeals) return;
    
    setSelectedMealType(mealType);
    setSelectedDayOfWeek(dayOfWeek);
    setShowRecipeSelector(true);
  };

  const handleRecipeSelected = (recipe: Recipe) => {
    saveMealMutation.mutate({ 
      mealType: selectedMealType, 
      dayOfWeek: selectedDayOfWeek, 
      content: recipe.name,
      recipeId: recipe.id 
    });
  };

  const handleSave = (mealType: string, dayOfWeek: number) => {
    saveMealMutation.mutate({ mealType, dayOfWeek, content: editValue });
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleToggleCompletion = (meal: Meal) => {
    toggleCompletionMutation.mutate({ id: meal.id });
  };

  const getMealContent = (mealType: string, dayOfWeek: number) => {
    const meal = meals.find(m => m.mealType === mealType && m.dayOfWeek === dayOfWeek);
    return meal;
  };

  const getWeekDateRange = () => {
    const weekEnd = addDays(currentWeek, 6);
    return `${format(currentWeek, "d 'de' MMM", { locale: es })} - ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: es })}`;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Calendario de Comidas</h2>
          <p className="text-gray-600 text-lg">{getWeekDateRange()}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateWeek('prev')}
            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateWeek('next')}
            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Calendar Table */}
      <Card className="shadow-xl border-0 bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <th className="p-4 text-left font-semibold w-48 border-r border-orange-400">
                    {/* Columna vacía para las etiquetas de comidas */}
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th key={day.id} className="p-4 text-center font-semibold min-w-[150px] border-r border-orange-400 last:border-r-0">
                      <div>
                        <div className="text-lg">{day.label}</div>
                        <div className="text-sm font-normal opacity-90">
                          {format(addDays(currentWeek, day.id), "d 'de' MMM", { locale: es })}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_ROWS.map((mealRow, rowIndex) => (
                  <tr key={mealRow.id} className="border-b hover:bg-orange-50/50 transition-colors">
                    <td className={`p-4 font-semibold text-gray-800 border-r border-gray-200 ${
                      rowIndex % 2 === 0 ? 'bg-orange-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        <Utensils className="h-4 w-4 mr-2 text-orange-600" />
                        {mealRow.label}
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const meal = getMealContent(mealRow.id, day.id);
                      const cellId = `${mealRow.id}-${day.id}`;
                      const isEditing = editingCell === cellId;
                      
                      return (
                        <td key={day.id} className="p-3 border-r border-gray-200 min-h-[100px] align-top bg-white hover:bg-orange-50/30 transition-colors">
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Escribir comida..."
                                className="text-sm border-orange-300 focus:border-orange-500"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(mealRow.id, day.id)}
                                  className="h-7 px-3 bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSelectRecipe(mealRow.id, day.id)}
                                  className="h-7 px-3 border-orange-300 hover:bg-orange-50"
                                  title="Seleccionar receta"
                                >
                                  <ChefHat className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancel}
                                  className="h-7 px-3 border-gray-300 hover:bg-gray-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`min-h-[80px] p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 border-dashed ${
                                canAddMeals ? 'hover:border-orange-300 hover:bg-orange-50' : 'border-gray-200'
                              } ${meal?.isCompleted ? 'bg-green-50 border-green-300 border-solid' : 'border-gray-200'} ${
                                meal && !meal.isCompleted ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 border-solid' : ''
                              }`}
                              onClick={() => handleCellClick(mealRow.id, day.id)}
                            >
                              {meal ? (
                                <div className="space-y-2">
                                  <p className={`text-sm font-medium ${meal.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {meal.content}
                                  </p>
                                  {meal.recipeId && (
                                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                      🍳 Receta
                                    </Badge>
                                  )}
                                  <div className="flex items-center justify-between">
                                    {canAddMeals && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 hover:bg-orange-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCellClick(mealRow.id, day.id);
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3 text-orange-600" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 hover:bg-green-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCompletion(meal);
                                      }}
                                    >
                                      <Check className={`h-3 w-3 ${meal.isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  {canAddMeals ? (
                                    <div className="text-center">
                                      <div className="text-gray-400 text-xs mb-1">Click para añadir</div>
                                      <div className="text-2xl opacity-30">+</div>
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Selector Modal */}
      <RecipeSelectorModal
        isOpen={showRecipeSelector}
        onClose={() => setShowRecipeSelector(false)}
        onSelectRecipe={handleRecipeSelected}
        mealType={selectedMealType}
      />

      {/* Info Panel */}
      {!canAddMeals && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800 text-sm">
              💡 Puedes marcar las comidas como completadas haciendo click en el botón ✓. 
              Solo el administrador puede editar el contenido del calendario.
            </p>
          </CardContent>
        </Card>
      )}
      
      {canAddMeals && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-green-800 text-sm">
              <p className="font-medium mb-2">💡 Funcionalidades del administrador:</p>
              <ul className="space-y-1 text-xs">
                <li>• Haz click en cualquier celda para editarla</li>
                <li>• Usa el botón <ChefHat className="h-3 w-3 inline mx-1" /> para seleccionar una receta</li>
                <li>• Las recetas se vinculan automáticamente con el inventario</li>
                <li>• Al marcar una receta como completada, se descuentan los ingredientes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
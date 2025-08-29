import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Edit2 } from "lucide-react";
import type { Meal, Recipe, InsertMeal } from "@shared/schema";

// Helper function to get Monday of a given week
const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to get week dates
const getWeekDates = (weekStart: Date): Date[] => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Meal types configuration
const MEAL_TYPES = [
  { id: 'desayuno_alba_mario', label: 'Desayuno Alba y Mario' },
  { id: 'desayuno_raquel_javier', label: 'Desayuno Raquel y Javier' },
  { id: 'almuerzo_alba_mario', label: 'Almuerzo Alba y Mario' },
  { id: 'almuerzo_raquel_javier', label: 'Almuerzo Raquel y Javier' },
  { id: 'comida', label: 'Comida' },
  { id: 'merienda_alba_mario', label: 'Merienda Alba y Mario' },
  { id: 'merienda_raquel_javier', label: 'Merienda Raquel y Javier' },
  { id: 'cena', label: 'Cena' },
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface MealCellProps {
  meal?: Meal;
  weekStart: string;
  dayOfWeek: number;
  mealType: string;
  onEdit: (meal: Meal | null, weekStart: string, dayOfWeek: number, mealType: string) => void;
  onComplete: (mealId: string) => void;
  recipes: Recipe[];
}

const MealCell = ({ meal, weekStart, dayOfWeek, mealType, onEdit, onComplete, recipes, canEdit = true }: MealCellProps & { canEdit?: boolean }) => {
  const recipe = meal?.recipeId ? recipes.find(r => r.id === meal.recipeId) : null;
  
  return (
    <td className="border border-gray-200 p-2 h-24 min-w-[150px] relative group">
      <div className="h-full flex flex-col">
        {meal ? (
          <>
            <div className="flex-1 text-sm">
              {recipe ? (
                <div className="font-medium text-blue-600">{recipe.name}</div>
              ) : (
                <div>{meal.content}</div>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(meal, weekStart, dayOfWeek, mealType)}
                  className="h-6 w-6 p-0"
                  data-testid={`edit-meal-${meal.id}`}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                {!meal.isCompleted && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onComplete(meal.id)}
                    className="h-6 w-6 p-0 text-green-600"
                    data-testid={`complete-meal-${meal.id}`}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            {meal.isCompleted && (
              <div className="absolute top-1 right-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            )}
          </>
        ) : canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(null, weekStart, dayOfWeek, mealType)}
            className="h-full w-full text-gray-400 border-dashed border-2 border-gray-200 hover:border-gray-300"
            data-testid={`add-meal-${dayOfWeek}-${mealType}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
            Sin comida
          </div>
        )}
      </div>
    </td>
  );
};

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  weekStart: string;
  dayOfWeek: number;
  mealType: string;
  recipes: Recipe[];
}

const MealModal = ({ isOpen, onClose, meal, weekStart, dayOfWeek, mealType, recipes }: MealModalProps) => {
  const [content, setContent] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (meal) {
      setContent(meal.content || '');
      setSelectedRecipeId(meal.recipeId || 'none');
    } else {
      setContent('');
      setSelectedRecipeId('none');
    }
  }, [meal, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertMeal) => {
      if (meal) {
        return await apiRequest('PUT', `/api/meal-plan/${meal.id}`, data);
      } else {
        return await apiRequest('POST', '/api/meal-plan', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan', weekStart] });
      toast({
        title: "Comida guardada",
        description: "La planificación se ha guardado exitosamente",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la comida",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const mealData: InsertMeal = {
      weekStart,
      dayOfWeek,
      mealType,
      content: content || undefined,
      recipeId: selectedRecipeId === 'none' ? undefined : selectedRecipeId || undefined,
      isCompleted: false,
    };

    saveMutation.mutate(mealData);
  };

  const mealTypeLabel = MEAL_TYPES.find(mt => mt.id === mealType)?.label || mealType;
  const dayName = DAYS[dayOfWeek];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="meal-modal">
        <DialogHeader>
          <DialogTitle>
            {meal ? 'Editar' : 'Agregar'} {mealTypeLabel} - {dayName}
          </DialogTitle>
          <DialogDescription>
            Puedes seleccionar una receta de tu inventario o escribir texto libre para planificar la comida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipe">Receta (opcional)</Label>
            <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
              <SelectTrigger data-testid="select-recipe">
                <SelectValue placeholder="Seleccionar receta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin receta</SelectItem>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name} ({recipe.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Texto libre (opcional)</Label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ej: Pan tostado con mermelada"
              data-testid="input-meal-content"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="button-save-meal"
            >
              {saveMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MealCalendarProps {
  userRole: string;
  canAddMeals: boolean;
}

export default function MealCalendar({ userRole, canAddMeals }: MealCalendarProps) {
  // Start with first week of September 2024
  const [currentWeek, setCurrentWeek] = useState(() => {
    const septemberFirst = new Date(2024, 8, 1); // September 1, 2024
    return getMonday(septemberFirst);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const weekStart = formatDate(currentWeek);
  const weekDates = getWeekDates(currentWeek);

  // Fetch meal plan for current week
  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ['/api/meal-plan', weekStart],
  });

  // Fetch recipes for selection
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const completeMutation = useMutation({
    mutationFn: async (mealId: string) => {
      return await apiRequest('PUT', `/api/meal-plan/${mealId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan', weekStart] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Comida completada",
        description: "Los ingredientes se han descontado del inventario",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar como completada",
        variant: "destructive",
      });
    },
  });

  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleEditMeal = (meal: Meal | null, weekStart: string, dayOfWeek: number, mealType: string) => {
    setSelectedMeal(meal);
    setSelectedWeekStart(weekStart);
    setSelectedDayOfWeek(dayOfWeek);
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  const handleCompleteMeal = (mealId: string) => {
    completeMutation.mutate(mealId);
  };

  // Create meal lookup for quick access
  const mealLookup = meals.reduce((acc, meal) => {
    const key = `${meal.dayOfWeek}-${meal.mealType}`;
    acc[key] = meal;
    return acc;
  }, {} as Record<string, Meal>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Calendario de Comidas</CardTitle>
            {!canAddMeals && (
              <p className="text-sm text-blue-600 mt-1">Solo visualización - No puedes añadir comidas</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              data-testid="button-previous-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              Semana del {weekDates[0].toLocaleDateString()} al {weekDates[6].toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              data-testid="button-next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 p-3 bg-gray-50 w-48"></th>
                {DAYS.map((day, index) => (
                  <th key={day} className="border border-gray-200 p-3 bg-gray-50 min-w-[150px]">
                    <div className="text-center">
                      <div className="font-semibold">{day}</div>
                      <div className="text-sm text-gray-600">
                        {weekDates[index].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((mealType) => (
                <tr key={mealType.id}>
                  <td className="border border-gray-200 p-3 bg-gray-50 font-medium">
                    {mealType.label}
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                    const meal = mealLookup[`${dayOfWeek}-${mealType.id}`];
                    return (
                      <MealCell
                        key={`${dayOfWeek}-${mealType.id}`}
                        meal={meal}
                        weekStart={weekStart}
                        dayOfWeek={dayOfWeek}
                        mealType={mealType.id}
                        onEdit={handleEditMeal}
                        onComplete={handleCompleteMeal}
                        recipes={recipes}
                        canEdit={canAddMeals}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <MealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        meal={selectedMeal}
        weekStart={selectedWeekStart}
        dayOfWeek={selectedDayOfWeek}
        mealType={selectedMealType}
        recipes={recipes}
      />
    </Card>
  );
}
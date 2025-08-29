import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMealSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import type { InsertMeal } from "@shared/schema";

interface MealModalProps {
  onClose: () => void;
}

const mealTypes = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'merienda', label: 'Merienda' },
  { value: 'cena', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
];

export default function MealModal({ onClose }: MealModalProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertMeal>({
    resolver: zodResolver(insertMealSchema),
    defaultValues: {
      name: "",
      description: "",
      mealType: "desayuno",
      date: format(new Date(), 'yyyy-MM-dd'),
      time: "08:00",
      ingredients: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertMeal) => {
      const response = await apiRequest("POST", "/api/meals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comida planificada",
        description: "La comida se ha planificado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meals', form.getValues('date')] });
      handleClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo planificar la comida. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = (data: InsertMeal) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="modal-meal">
        <DialogHeader>
          <DialogTitle>Nueva Comida</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la comida</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Ensalada de pollo" 
                      {...field}
                      data-testid="input-meal-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción de la comida..." 
                      className="h-20"
                      {...field}
                      data-testid="textarea-meal-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de comida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-meal-type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        data-testid="input-meal-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                        data-testid="input-meal-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredientes (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Lista de ingredientes..." 
                      className="h-20"
                      {...field}
                      data-testid="textarea-meal-ingredients"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-meal"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary hover:bg-secondary/90"
                disabled={mutation.isPending}
                data-testid="button-create-meal"
              >
                {mutation.isPending ? "Planificando..." : "Planificar Comida"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

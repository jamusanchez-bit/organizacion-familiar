import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivitySchema } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";
import type { InsertActivity } from "@shared/schema";

interface ActivityModalProps {
  onClose: () => void;
}

const categories = [
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'personal', label: 'Personal' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'salud', label: 'Salud' },
  { value: 'social', label: 'Social' },
];

const users = [
  { value: 'javier', label: 'Javier' },
  { value: 'raquel', label: 'Raquel' },
  { value: 'mario', label: 'Mario' },
  { value: 'alba', label: 'Alba' },
];

const recurringTypes = [
  { value: 'daily', label: 'Todos los días' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'custom', label: 'Días específicos' },
];

const daysOfWeek = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
];

export default function ActivityModal({ onClose }: ActivityModalProps) {
  const [open, setOpen] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertActivity>({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      category: "personal",
      assignedTo: "javier",
      durationMinutes: 60,
      isRecurring: false,
      recurringType: undefined,
      recurringDays: undefined,
      recurringEndDate: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      // Process recurring days for custom weekly schedules
      if (data.isRecurring && data.recurringType === 'custom' && selectedDays.length > 0) {
        data.recurringDays = JSON.stringify(selectedDays);
      }
      
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Actividad creada",
        description: "La actividad se ha creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities', form.getValues('date')] });
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
        description: "No se pudo crear la actividad. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = (data: InsertActivity) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-activity">
        <DialogHeader>
          <DialogTitle>Nueva Actividad</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Reunión de trabajo" 
                      {...field}
                      data-testid="input-activity-title"
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
                      placeholder="Descripción opcional..." 
                      className="h-20"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-activity-description"
                    />
                  </FormControl>
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
                        data-testid="input-activity-date"
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
                        data-testid="input-activity-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="5"
                        max="1440"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        value={field.value || 60}
                        data-testid="input-activity-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignado a</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-activity-user">
                          <SelectValue placeholder="Selecciona usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.value} value={user.value}>
                            {user.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-activity-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Repetición */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-activity-recurring"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Se repite
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Crear actividad recurrente
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <FormField
                  control={form.control}
                  name="recurringType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de repetición</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-recurring-type">
                            <SelectValue placeholder="Selecciona frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recurringTypes.map((type) => (
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

                {form.watch("recurringType") === "custom" && (
                  <div>
                    <FormLabel className="text-sm font-medium">Días de la semana</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <label key={day.value} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            checked={selectedDays.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDays([...selectedDays, day.value]);
                              } else {
                                setSelectedDays(selectedDays.filter(d => d !== day.value));
                              }
                            }}
                            data-testid={`checkbox-day-${day.value}`}
                          />
                          <span>{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="recurringEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de fin (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-recurring-end-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-activity"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={mutation.isPending}
                data-testid="button-create-activity"
              >
                {mutation.isPending ? "Creando..." : "Crear Actividad"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

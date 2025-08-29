import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryItemSchema } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InsertInventoryItem } from "@shared/schema";

interface InventoryModalProps {
  onClose: () => void;
}

const categories = [
  { value: 'frutas', label: 'Frutas' },
  { value: 'verduras', label: 'Verduras' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'pescado', label: 'Pescado' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'granos', label: 'Granos' },
  { value: 'frutos_secos', label: 'Frutos Secos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'condimentos', label: 'Condimentos' },
  { value: 'limpieza_hogar', label: 'Productos de Limpieza/Hogar' },
  { value: 'otros', label: 'Otros' },
];

const units = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'paquetes', label: 'Paquetes' },
  { value: 'latas', label: 'Latas' },
  { value: 'tarros', label: 'Tarros' },
];

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      name: "",
      category: "otros",
      currentQuantity: "0",
      minimumQuantity: "1",
      unit: "unidades",
      icon: "fas fa-utensils",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertInventoryItem) => {
      const response = await apiRequest("POST", "/api/inventory", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto agregado",
        description: "El producto se ha agregado al inventario exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
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
        description: "No se pudo agregar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = (data: InsertInventoryItem) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="modal-inventory">
        <DialogHeader>
          <DialogTitle>Agregar Producto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del producto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Manzanas rojas" 
                      {...field}
                      data-testid="input-inventory-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-inventory-category">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad actual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        {...field}
                        data-testid="input-inventory-current-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad mínima</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1"
                        {...field}
                        data-testid="input-inventory-minimum-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de medida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-inventory-unit">
                        <SelectValue placeholder="Selecciona la unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                data-testid="button-cancel-inventory"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary hover:bg-secondary/90"
                disabled={mutation.isPending}
                data-testid="button-create-inventory-item"
              >
                {mutation.isPending ? "Agregando..." : "Agregar Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

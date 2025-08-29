import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@shared/schema";

interface InventoryQuantityModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export default function InventoryQuantityModal({ item, onClose }: InventoryQuantityModalProps) {
  const [open, setOpen] = useState(true);
  const [quantity, setQuantity] = useState(parseFloat(item.currentQuantity));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const response = await apiRequest("PUT", `/api/inventory/${item.id}`, {
        currentQuantity: newQuantity.toString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cantidad actualizada",
        description: `${item.name} actualizado a ${quantity} ${item.unit}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  const handleIncrease = () => {
    setQuantity(prev => Math.max(0, prev + 1));
  };

  const handleDecrease = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const handleSave = () => {
    updateMutation.mutate(quantity);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm" data-testid="modal-inventory-quantity">
        <DialogHeader>
          <DialogTitle>Ajustar Cantidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{item.category}</p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={quantity <= 0}
              data-testid="button-decrease-quantity"
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[80px]">
              <div className="text-2xl font-bold text-gray-800">
                {quantity}
              </div>
              <div className="text-sm text-gray-600">
                {item.unit}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              data-testid="button-increase-quantity"
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {parseFloat(item.minimumQuantity) > 0 && quantity <= parseFloat(item.minimumQuantity) && (
            <div className="text-center">
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                Stock bajo (mínimo: {item.minimumQuantity} {item.unit})
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            data-testid="button-cancel-quantity"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={updateMutation.isPending}
            data-testid="button-save-quantity"
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

interface QuickStockUpdateProps {
  item: InventoryItem;
}

export default function QuickStockUpdate({ item }: QuickStockUpdateProps) {
  const [quickAmount, setQuickAmount] = useState("");
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
        title: "Stock actualizado",
        description: `Stock de ${item.name} actualizado correctamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      setQuickAmount("");
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
        description: "No se pudo actualizar el stock. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleQuickUpdate = (operation: 'add' | 'subtract' | 'set') => {
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Cantidad inválida",
        description: "Por favor ingresa un número válido.",
        variant: "destructive",
      });
      return;
    }

    const currentQty = parseFloat(item.currentQuantity);
    let newQuantity: number;

    switch (operation) {
      case 'add':
        newQuantity = currentQty + amount;
        break;
      case 'subtract':
        newQuantity = Math.max(0, currentQty - amount);
        break;
      case 'set':
        newQuantity = amount;
        break;
    }

    updateMutation.mutate(newQuantity);
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="Cantidad"
        value={quickAmount}
        onChange={(e) => setQuickAmount(e.target.value)}
        className="w-20 text-xs"
        data-testid={`input-quick-stock-${item.id}`}
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickUpdate('add')}
          disabled={updateMutation.isPending || !quickAmount}
          className="p-2 h-8 w-8"
          data-testid={`button-add-stock-${item.id}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickUpdate('subtract')}
          disabled={updateMutation.isPending || !quickAmount}
          className="p-2 h-8 w-8"
          data-testid={`button-subtract-stock-${item.id}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleQuickUpdate('set')}
          disabled={updateMutation.isPending || !quickAmount}
          className="text-xs px-2 h-8"
          data-testid={`button-set-stock-${item.id}`}
        >
          Set
        </Button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Plus, Minus, Edit2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getUserPermissions, INVENTORY_CATEGORIES } from "@/utils/userPermissions";
import type { InventoryItem } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface InventorySectionProps {
  userRole: UserRole;
}

export default function InventorySection({ userRole }: InventorySectionProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const permissions = getUserPermissions(userRole, 'inventario');

  // Fetch inventory
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    staleTime: 30000,
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: string }) => {
      const response = await apiRequest("PUT", `/api/inventory/${id}`, {
        currentQuantity: quantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      setEditingItem(null);
      setEditQuantity('');
      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del producto se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (item: InventoryItem, delta: number) => {
    const newQuantity = Math.max(0, parseFloat(item.currentQuantity) + delta);
    updateQuantityMutation.mutate({ id: item.id, quantity: newQuantity.toString() });
  };

  const handleEditQuantity = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditQuantity(item.currentQuantity);
  };

  const handleSaveQuantity = (id: string) => {
    if (editQuantity && parseFloat(editQuantity) >= 0) {
      updateQuantityMutation.mutate({ id, quantity: editQuantity });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      carne: 'bg-red-100 text-red-800 border-red-200',
      pescado: 'bg-blue-100 text-blue-800 border-blue-200',
      verdura: 'bg-green-100 text-green-800 border-green-200',
      fruta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      frutos_secos: 'bg-orange-100 text-orange-800 border-orange-200',
      productos_limpieza_hogar: 'bg-purple-100 text-purple-800 border-purple-200',
      otros: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.otros;
  };

  const getStockStatus = (item: InventoryItem) => {
    const current = parseFloat(item.currentQuantity);
    const minimum = parseFloat(item.minimumQuantity);
    
    if (current === 0) return { status: 'empty', color: 'text-red-600', bg: 'bg-red-50' };
    if (current <= minimum) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Group items by category
  const groupedItems = INVENTORY_CATEGORIES.reduce((groups, category) => {
    groups[category.value] = inventory.filter(item => item.category === category.value);
    return groups;
  }, {} as Record<string, InventoryItem[]>);

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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Inventario
        </h2>
        <p className="text-gray-600 text-lg">
          {permissions.canAddItems ? 'Gestiona tu stock de alimentos' : 'Consulta el stock disponible'}
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {INVENTORY_CATEGORIES.map((category) => {
          const items = groupedItems[category.value] || [];
          
          if (items.length === 0) return null;
          
          return (
            <Card key={category.value} className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category.value)}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {category.label}
                    </h3>
                    <p className="text-sm text-gray-500 font-normal">
                      {items.length} productos
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const isEditing = editingItem === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${stockStatus.bg} ${
                          stockStatus.status === 'empty' ? 'border-red-200' :
                          stockStatus.status === 'low' ? 'border-orange-200' : 'border-green-200'
                        } hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                              {INVENTORY_CATEGORIES.find(c => c.value === item.category)?.label}
                            </Badge>
                          </div>
                          {stockStatus.status === 'empty' && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Quantity Display/Edit */}
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="flex-1 h-8 text-sm"
                                min="0"
                                step="0.1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveQuantity(item.id)}
                                className="h-8 px-3"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingItem(null)}
                                className="h-8 px-3"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${stockStatus.color}`}>
                                  {parseFloat(item.currentQuantity)} {item.unit}
                                </span>
                                {permissions.canAdjustQuantity && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditQuantity(item)}
                                    className="h-6 w-6 p-0 hover:bg-gray-200"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              
                              {permissions.canAdjustQuantity && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item, -0.1)}
                                    className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-300"
                                    disabled={parseFloat(item.currentQuantity) <= 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item, 0.1)}
                                    className="h-7 w-7 p-0 hover:bg-green-50 hover:border-green-300"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Stock Status */}
                          <div className="text-xs text-gray-600">
                            Mínimo: {parseFloat(item.minimumQuantity)} {item.unit}
                          </div>
                          
                          {/* Purchase Location */}
                          <div className="text-xs text-gray-500">
                            📍 {item.purchaseLocation?.replace(/_/g, ' ') || 'Sin ubicación'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Panel */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Package className="h-6 w-6 text-purple-600 mt-1" />
            <div className="text-purple-800">
              <p className="font-medium mb-2">💡 Funcionalidades del inventario:</p>
              <ul className="space-y-1 text-sm">
                <li>• 🔴 Productos sin stock se añaden automáticamente a la lista de compra</li>
                <li>• 🟡 Productos con stock bajo aparecen como sugerencias</li>
                {permissions.canAdjustQuantity && (
                  <li>• ➕➖ Usa los botones + y - para ajustar cantidades rápidamente</li>
                )}
                <li>• 📊 Los colores indican el estado del stock (verde=bien, naranja=bajo, rojo=vacío)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
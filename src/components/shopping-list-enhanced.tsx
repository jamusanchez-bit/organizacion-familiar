import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PURCHASE_CATEGORIES } from "@/utils/userPermissions";
import type { ShoppingListItem, InventoryItem } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface ShoppingListEnhancedProps {
  userRole: UserRole;
  canAddItems: boolean;
}

export default function ShoppingListEnhanced({ userRole, canAddItems }: ShoppingListEnhancedProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('unidades');
  const [newItemCategory, setNewItemCategory] = useState('otros');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shopping list
  const { data: shoppingList = [], isLoading } = useQuery<ShoppingListItem[]>({
    queryKey: ['/api/shopping-list'],
    staleTime: 30000,
  });

  // Fetch inventory for suggestions and auto-add
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    staleTime: 30000,
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory/low-stock'],
    staleTime: 30000,
  });

  // Auto-add items with 0 quantity to shopping list
  const autoAddMutation = useMutation({
    mutationFn: async (item: InventoryItem) => {
      const response = await apiRequest("POST", "/api/shopping-list", {
        name: item.name,
        category: item.purchaseLocation || "otros",
        quantity: item.minimumQuantity || "1",
        unit: item.unit,
        isPurchased: false,
        isAutoAdded: true,
        inventoryItemId: item.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
    },
  });

  // Add manual item
  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await apiRequest("POST", "/api/shopping-list", itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('unidades');
      setNewItemCategory('otros');
      setShowAddForm(false);
      toast({
        title: "Producto añadido",
        description: "El producto se ha añadido a la lista de compra.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo añadir el producto.",
        variant: "destructive",
      });
    },
  });

  // Toggle item purchased
  const togglePurchasedMutation = useMutation({
    mutationFn: async ({ id, isPurchased }: { id: string; isPurchased: boolean }) => {
      const response = await apiRequest("PATCH", `/api/shopping-list/${id}`, { isPurchased });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/shopping-list/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list'] });
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado de la lista.",
      });
    },
  });

  // Auto-add items with 0 quantity
  useEffect(() => {
    const zeroQuantityItems = inventory.filter(item => 
      parseFloat(item.currentQuantity) === 0 &&
      !shoppingList.some(shopItem => shopItem.inventoryItemId === item.id)
    );

    zeroQuantityItems.forEach(item => {
      autoAddMutation.mutate(item);
    });
  }, [inventory, shoppingList]);

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Introduce el nombre del producto.",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity,
      unit: newItemUnit,
      isPurchased: false,
      isAutoAdded: false,
    });
  };

  const handleTogglePurchased = (item: ShoppingListItem) => {
    togglePurchasedMutation.mutate({
      id: item.id,
      isPurchased: !item.isPurchased,
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const handleAddSuggestion = (suggestion: InventoryItem) => {
    addItemMutation.mutate({
      name: suggestion.name,
      category: suggestion.purchaseLocation || "otros",
      quantity: suggestion.minimumQuantity || "1",
      unit: suggestion.unit,
      isPurchased: false,
      isAutoAdded: false,
      inventoryItemId: suggestion.id,
    });
  };

  // Group items by category
  const groupedItems = PURCHASE_CATEGORIES.reduce((groups, category) => {
    groups[category.value] = shoppingList.filter(item => item.category === category.value);
    return groups;
  }, {} as Record<string, ShoppingListItem[]>);

  // Get suggestions (items with quantity = 1 that aren't in shopping list)
  const suggestions = inventory.filter(item => 
    parseFloat(item.currentQuantity) === 1 &&
    !shoppingList.some(shopItem => shopItem.inventoryItemId === item.id)
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Lista de la Compra</h2>
          <p className="text-gray-600">Organiza tus compras por categorías</p>
        </div>
        
        {canAddItems && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Producto
          </Button>
        )}
      </div>

      {/* Add Item Form */}
      {showAddForm && canAddItems && (
        <Card>
          <CardHeader>
            <CardTitle>Añadir Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Nombre del producto"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Cantidad"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                min="0.1"
                step="0.1"
              />
              <Input
                placeholder="Unidad (kg, l, unidades...)"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
              />
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                {addItemMutation.isPending ? "Añadiendo..." : "Añadir"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Sugerencias (Stock Bajo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Estos productos tienen solo 1 unidad en stock. ¿Quieres añadirlos a la lista?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">{item.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSuggestion(item)}
                    disabled={addItemMutation.isPending}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shopping List by Categories */}
      <div className="space-y-6">
        {PURCHASE_CATEGORIES.map((category) => {
          const items = groupedItems[category.value] || [];
          const purchasedItems = items.filter(item => item.isPurchased);
          const pendingItems = items.filter(item => !item.isPurchased);
          
          return (
            <Card key={category.value}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    {category.label}
                  </div>
                  <div className="flex gap-2">
                    {pendingItems.length > 0 && (
                      <Badge variant="outline">
                        {pendingItems.length} pendientes
                      </Badge>
                    )}
                    {purchasedItems.length > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {purchasedItems.length} comprados
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay productos en esta categoría
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Pending items first */}
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.isPurchased}
                            onCheckedChange={() => handleTogglePurchased(item)}
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {parseFloat(item.quantity)} {item.unit}
                              {item.isAutoAdded && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Auto
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        {canAddItems && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {/* Purchased items */}
                    {purchasedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg opacity-75"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.isPurchased}
                            onCheckedChange={() => handleTogglePurchased(item)}
                          />
                          <div>
                            <p className="font-medium line-through text-gray-600">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {parseFloat(item.quantity)} {item.unit}
                              <Badge variant="default" className="ml-2 text-xs bg-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Comprado
                              </Badge>
                            </p>
                          </div>
                        </div>
                        {canAddItems && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Panel */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-1">💡 Funcionalidades automáticas:</p>
              <ul className="space-y-1 text-xs">
                <li>• Los productos con cantidad 0 se añaden automáticamente</li>
                <li>• Los productos con cantidad 1 aparecen como sugerencias</li>
                <li>• Marca los productos como comprados tocando el checkbox</li>
                {canAddItems && <li>• Solo el administrador puede añadir/eliminar productos</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
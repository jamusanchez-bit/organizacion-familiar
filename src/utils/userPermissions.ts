// Sistema de permisos de usuarios según especificaciones
export type UserRole = 'javi_administrador' | 'javier' | 'raquel' | 'mario' | 'alba';

export interface UserPermissions {
  canView: boolean;
  canAddItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
  canMarkCompleted: boolean;
  canSendMessages: boolean;
  canAdjustQuantity: boolean; // Para inventario: poder ajustar cantidades con +/-
}

export interface SectionAccess {
  inicio: boolean;
  actividades: boolean;
  calendario_comidas: boolean;
  recetas: boolean;
  inventario: boolean;
  lista_compra: boolean;
  mensajes: boolean;
}

// Configuración de permisos por usuario y sección según especificaciones
export const USER_PERMISSIONS: Record<UserRole, Record<string, UserPermissions>> = {
  javi_administrador: {
    inicio: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    actividades: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    calendario_comidas: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    recetas: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    inventario: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    lista_compra: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true },
    mensajes: { canView: true, canAddItems: true, canEditItems: true, canDeleteItems: true, canMarkCompleted: true, canSendMessages: true, canAdjustQuantity: true }
  },
  javier: {
    inicio: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false },
    actividades: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Solo sus actividades
    calendario_comidas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false },
    recetas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false }, // Solo ver
    inventario: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: true }, // Solo ajustar cantidades
    lista_compra: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Puede añadir elementos
    mensajes: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: true, canAdjustQuantity: false }
  },
  raquel: {
    inicio: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false },
    actividades: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Solo sus actividades
    calendario_comidas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false },
    recetas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false }, // Solo ver
    inventario: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: true }, // Solo ajustar cantidades
    lista_compra: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Puede añadir elementos
    mensajes: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: true, canAdjustQuantity: false }
  },
  mario: {
    inicio: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false },
    actividades: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Solo sus actividades
    calendario_comidas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false },
    recetas: { canView: false, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false }, // Mario no tiene acceso a recetas
    inventario: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: true }, // Solo ajustar cantidades
    lista_compra: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Puede añadir elementos
    mensajes: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: true, canAdjustQuantity: false }
  },
  alba: {
    inicio: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false },
    actividades: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Solo sus actividades
    calendario_comidas: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false },
    recetas: { canView: false, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: false }, // Alba no tiene acceso a recetas
    inventario: { canView: true, canAddItems: false, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: false, canAdjustQuantity: true }, // Solo ajustar cantidades
    lista_compra: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: true, canSendMessages: false, canAdjustQuantity: false }, // Puede añadir elementos
    mensajes: { canView: true, canAddItems: true, canEditItems: false, canDeleteItems: false, canMarkCompleted: false, canSendMessages: true, canAdjustQuantity: false }
  }
};

// Configuración de acceso a secciones por usuario
export const SECTION_ACCESS: Record<UserRole, SectionAccess> = {
  javi_administrador: {
    inicio: true,
    actividades: true,
    calendario_comidas: true,
    recetas: true,
    inventario: true,
    lista_compra: true,
    mensajes: true
  },
  javier: {
    inicio: true,
    actividades: true,
    calendario_comidas: true,
    recetas: true,
    inventario: true,
    lista_compra: true,
    mensajes: true
  },
  raquel: {
    inicio: true,
    actividades: true,
    calendario_comidas: true,
    recetas: true,
    inventario: true,
    lista_compra: true,
    mensajes: true
  },
  mario: {
    inicio: true,
    actividades: true,
    calendario_comidas: true,
    recetas: false, // Mario no tiene acceso a recetas
    inventario: true,
    lista_compra: true,
    mensajes: true
  },
  alba: {
    inicio: true,
    actividades: true,
    calendario_comidas: true,
    recetas: false, // Alba no tiene acceso a recetas
    inventario: true,
    lista_compra: true,
    mensajes: true
  }
};

// Categorías de compra según especificaciones
export const PURCHASE_CATEGORIES = [
  { value: 'carne_internet', label: 'Carne Internet' },
  { value: 'pescaderia', label: 'Pescadería' },
  { value: 'del_bancal_a_casa', label: 'Del Bancal a Casa' },
  { value: 'alcampo', label: 'Alcampo' },
  { value: 'internet', label: 'Internet' },
  { value: 'otros', label: 'Otros' }
];

// Categorías de inventario según especificaciones
export const INVENTORY_CATEGORIES = [
  { value: 'carne', label: 'Carne' },
  { value: 'pescado', label: 'Pescado' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'fruta', label: 'Fruta' },
  { value: 'frutos_secos', label: 'Frutos Secos' },
  { value: 'productos_limpieza_hogar', label: 'Productos de Limpieza/Hogar' },
  { value: 'otros', label: 'Otros' }
];

// Categorías de recetas según especificaciones
export const RECIPE_CATEGORIES = [
  { value: 'comidas', label: 'Comidas' },
  { value: 'cenas', label: 'Cenas' }
];

// Función para obtener rol de usuario basado en email
export function getUserRole(email: string): UserRole {
  if (email === 'jamusanchez+admin@gmail.com') return 'javi_administrador';
  if (email === 'jamusanchez@gmail.com') return 'javier';
  if (email.includes('raquel')) return 'raquel';
  if (email.includes('mario')) return 'mario';
  if (email.includes('alba')) return 'alba';
  return 'javier'; // default
}

// Función para obtener permisos de usuario
export function getUserPermissions(userRole: UserRole, section: string): UserPermissions {
  return USER_PERMISSIONS[userRole]?.[section] || {
    canView: false,
    canAddItems: false,
    canEditItems: false,
    canDeleteItems: false,
    canMarkCompleted: false,
    canSendMessages: false,
    canAdjustQuantity: false
  };
}

// Función para verificar acceso a sección
export function canAccessSection(userRole: UserRole, section: keyof SectionAccess): boolean {
  return SECTION_ACCESS[userRole]?.[section] || false;
}
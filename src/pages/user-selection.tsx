import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const users = [
  {
    id: 'javi_administrador',
    name: 'Javi (Administrador)',
    email: 'jamusanchez+admin@gmail.com',
    description: 'Acceso completo con permisos de edición',
    icon: Crown,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
  },
  {
    id: 'javier',
    name: 'Javier',
    email: 'jamusanchez@gmail.com',
    description: 'Usuario familiar con permisos limitados',
    icon: User,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  {
    id: 'raquel',
    name: 'Raquel',
    email: 'raquel@familia.com',
    description: 'Usuario familiar con permisos limitados',
    icon: User,
    color: 'bg-pink-500/10 text-pink-600 border-pink-200'
  },
  {
    id: 'mario',
    name: 'Mario',
    email: 'mario@familia.com',
    description: 'Usuario familiar con permisos limitados',
    icon: User,
    color: 'bg-green-500/10 text-green-600 border-green-200'
  },
  {
    id: 'alba',
    name: 'Alba',
    email: 'alba@familia.com',
    description: 'Usuario familiar con permisos limitados',
    icon: User,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
  }
];

export default function UserSelection() {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleUserSelect = async (userId: string) => {
    setIsLoading(true);
    try {
      // Guardar el usuario seleccionado en localStorage
      localStorage.setItem('selectedFamilyUser', userId);
      
      // Redirigir a la aplicación principal
      window.location.href = '/';
    } catch (error) {
      console.error('Error selecting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-neutral-800">Organización Familiar</h1>
          </div>
          <p className="text-xl text-neutral-600 mb-4">
            Bienvenido, {(user as any)?.firstName || (user as any)?.email || 'Usuario'}
          </p>
          <p className="text-lg text-neutral-500">
            Selecciona tu perfil familiar para continuar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((familyUser) => {
            const IconComponent = familyUser.icon;
            return (
              <Card 
                key={familyUser.id} 
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedUser === familyUser.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => setSelectedUser(familyUser.id)}
                data-testid={`card-user-${familyUser.id}`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${familyUser.color} rounded-lg flex items-center justify-center mx-auto mb-4 border`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    {familyUser.name}
                  </h3>

                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => selectedUser && handleUserSelect(selectedUser)}
            disabled={!selectedUser || isLoading}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
            data-testid="button-continue"
          >
            {isLoading ? 'Cargando...' : 'Continuar'}
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="lg"
            className="border-neutral-300 text-neutral-600 hover:bg-neutral-100 px-8 py-3"
            data-testid="button-logout"
          >
            Cerrar Sesión
          </Button>
        </div>

        {selectedUser && (
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Has seleccionado: <span className="font-medium">
                {users.find(u => u.id === selectedUser)?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
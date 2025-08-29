import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const USERS = [
  { id: 'javier', name: 'Javier', password: 'password123', color: 'text-blue-600' },
  { id: 'raquel', name: 'Raquel', password: 'password456', color: 'text-pink-600' },
  { id: 'mario', name: 'Mario', password: 'password789', color: 'text-green-600' },
  { id: 'alba', name: 'Alba', password: 'password000', color: 'text-purple-600' },
];

interface UserSwitcherProps {
  currentUser?: string;
}

export default function UserSwitcher({ currentUser }: UserSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSwitchUser = async (userId: string, password: string) => {
    setIsLoading(true);

    try {
      // Logout current user
      await fetch('/api/simple-auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Login as new user
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userId, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Clear family user selection to force re-selection
        localStorage.removeItem('selectedFamilyUser');
        
        toast({
          title: "Usuario cambiado",
          description: `Ahora estás conectado como ${data.user.firstName}`,
        });
        
        // Reload the page to refresh the auth state
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al cambiar de usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/simple-auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      localStorage.removeItem('selectedFamilyUser');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar redirección incluso si hay error
      localStorage.removeItem('selectedFamilyUser');
      window.location.href = '/';
    }
  };

  const currentUserData = USERS.find(u => u.id === currentUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:text-white rounded-xl">
          <User className="h-4 w-4" />
          {currentUserData ? (
            <span>{currentUserData.name}</span>
          ) : (
            "Usuario"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-slate-200">Cambiar Usuario</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {USERS.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleSwitchUser(user.id, user.password)}
            disabled={isLoading || user.id === currentUser}
            className="gap-2 text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
          >
            <Users className="h-4 w-4" />
            <span>{user.name}</span>
            {user.id === currentUser && (
              <span className="ml-auto text-xs text-blue-400">(actual)</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-400 hover:bg-red-500/20 focus:bg-red-500/20">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
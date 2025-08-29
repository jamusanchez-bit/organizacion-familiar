import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const USERS = [
  { id: 'javier', name: 'Javier', password: 'password123', color: 'bg-blue-500' },
  { id: 'raquel', name: 'Raquel', password: 'password456', color: 'bg-pink-500' },
  { id: 'mario', name: 'Mario', password: 'password789', color: 'bg-green-500' },
  { id: 'alba', name: 'Alba', password: 'password000', color: 'bg-purple-500' },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${data.user.firstName}`,
        });
        window.location.href = "/";
      } else {
        toast({
          title: "Error",
          description: data.message || "Credenciales inválidas",
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

  const handleQuickLogin = async (userId: string, userPassword: string) => {
    setUsername(userId);
    setPassword(userPassword);
    setIsLoading(true);

    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userId, password: userPassword }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${data.user.firstName}`,
        });
        window.location.href = "/";
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al iniciar sesión",
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

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-neutral-800">Organización Familiar</h1>
          </div>
          <p className="text-neutral-600">Selecciona tu usuario o inicia sesión</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700 text-center">Acceso rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            {USERS.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className={`h-16 flex flex-col items-center justify-center space-y-1 hover:${user.color} hover:text-white transition-colors`}
                onClick={() => handleQuickLogin(user.id, user.password)}
                disabled={isLoading}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-2 text-neutral-500">O inicia sesión manualmente</span>
          </div>
        </div>

        {/* Manual Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="javier, raquel, mario, alba"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Development Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información de desarrollo</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Javier:</strong> password123</p>
              <p><strong>Raquel:</strong> password456</p>
              <p><strong>Mario:</strong> password789</p>
              <p><strong>Alba:</strong> password000</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
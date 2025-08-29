import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock } from 'lucide-react';

interface SimpleLoginProps {
  onLoginSuccess: () => void;
}

const PREDEFINED_USERS = [
  { username: 'javier', name: 'Javier', color: 'bg-blue-500' },
  { username: 'raquel', name: 'Raquel', color: 'bg-pink-500' },
  { username: 'mario', name: 'Mario', color: 'bg-green-500' },
  { username: 'alba', name: 'Alba', color: 'bg-purple-500' },
];

export default function SimpleLogin({ onLoginSuccess }: SimpleLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        onLoginSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'Error de inicio de sesión');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    // Set default password pattern for development
    const passwords: Record<string, string> = {
      javier: 'password123',
      raquel: 'password456',
      mario: 'password789',
      alba: 'password000'
    };
    setPassword(passwords[selectedUsername] || '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CalendApp</CardTitle>
          <CardDescription>
            Gestión personal familiar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">
              Selecciona tu usuario:
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_USERS.map((user) => (
                <Button
                  key={user.username}
                  variant={username === user.username ? "default" : "outline"}
                  className="h-12 justify-start"
                  onClick={() => handleUserSelect(user.username)}
                  data-testid={`button-select-${user.username}`}
                >
                  <div className={`w-3 h-3 rounded-full ${user.color} mr-2`} />
                  {user.name}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription data-testid="error-message">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Credenciales de prueba:</p>
            <p>javier/password123, raquel/password456</p>
            <p>mario/password789, alba/password000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
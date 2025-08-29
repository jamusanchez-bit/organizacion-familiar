import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sunriseImage = "/images/Sunrise_over_horizon_drawing_5741a59c.png";

const USERS = [
  { id: 'javier', name: 'Javier', password: 'password123', color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
  { id: 'raquel', name: 'Raquel', password: 'password456', color: 'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700' },
  { id: 'mario', name: 'Mario', password: 'password789', color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' },
  { id: 'alba', name: 'Alba', password: 'password000', color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' },
  { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123', color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' },
];

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    setShowUserSelection(true);
  };

  const handleUserLogin = async (userId: string, password: string) => {
    setIsLoading(true);

    try {
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
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${data.user.firstName}`,
        });
        
        // Set the selected family user
        localStorage.setItem('selectedFamilyUser', userId);
        
        // Redirect to home
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
        description: "Error de conexión. Asegúrate de que el servidor esté funcionando.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showUserSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Organización Familiar
            </h1>
            <p className="text-gray-600 text-lg">Selecciona tu usuario para continuar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {USERS.map((user) => (
              <Button
                key={user.id}
                className={`h-24 flex flex-col items-center justify-center space-y-2 text-white ${user.color} transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-2xl border-0`}
                onClick={() => handleUserLogin(user.id, user.password)}
                disabled={isLoading}
              >
                <User className="h-7 w-7" />
                <span className="font-semibold text-lg">{user.name}</span>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowUserSelection(false)}
              disabled={isLoading}
              className="border-gray-300 hover:bg-gray-50 rounded-xl"
            >
              ← Volver
            </Button>
          </div>

          {/* Development Info */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg rounded-2xl">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <span className="mr-2">🔑</span>
                Información de desarrollo
              </h4>
              <div className="text-xs text-blue-700 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Javier:</strong> password123</p>
                  <p><strong>Raquel:</strong> password456</p>
                  <p><strong>Mario:</strong> password789</p>
                  <p><strong>Alba:</strong> password000</p>
                </div>
                <p className="text-center pt-2 border-t border-blue-200">
                  <strong>Javi (Admin):</strong> admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Organización Familiar
          </h1>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border border-white/20 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
              "Si vives con gratitud, estás reprogramando tu cerebro para la abundancia."
            </p>
            <p className="text-lg text-gray-500 mt-4">— Joe Dispenza</p>
          </div>
          
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 mb-8"
            data-testid="button-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Cargando...
              </>
            ) : (
              <>
                🚀 Iniciar Sesión
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="max-w-3xl w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"></div>
              <img 
                src={sunriseImage} 
                alt="Sol saliendo por el horizonte" 
                className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

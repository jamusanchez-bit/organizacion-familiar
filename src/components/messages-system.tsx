import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Users, User, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface MessagesSystemProps {
  userRole: UserRole;
  currentUser: string;
  canSendMessages: boolean;
}

const FAMILY_USERS = [
  { value: 'javier', label: 'Javier' },
  { value: 'raquel', label: 'Raquel' },
  { value: 'mario', label: 'Mario' },
  { value: 'alba', label: 'Alba' },
];

export default function MessagesSystem({ userRole, currentUser, canSendMessages }: MessagesSystemProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [activeTab, setActiveTab] = useState('forum');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages based on type
  const { data: forumMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', 'forum'],
    staleTime: 10000,
  });

  const { data: adminSuggestions = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', 'admin_suggestion'],
    staleTime: 10000,
  });

  const { data: privateMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', 'private', currentUser],
    staleTime: 10000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType, recipientName }: { 
      content: string; 
      messageType: string; 
      recipientName?: string; 
    }) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        messageType,
        senderName: currentUser,
        recipientName: recipientName || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage('');
      setSelectedRecipient('');
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje se ha enviado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (messageType: string, recipientName?: string) => {
    if (!newMessage.trim()) {
      toast({
        title: "Error",
        description: "Escribe un mensaje antes de enviarlo.",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'private' && !recipientName) {
      toast({
        title: "Error",
        description: "Selecciona un destinatario para el mensaje privado.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({ content: newMessage, messageType, recipientName });
  };

  const formatMessageTime = (createdAt: string) => {
    return format(new Date(createdAt), "d 'de' MMM 'a las' HH:mm", { locale: es });
  };

  const renderForumMessages = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Esta semana quiero que hablemos de:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {forumMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay mensajes aún. ¡Sé el primero en escribir!
              </p>
            ) : (
              forumMessages.map((message) => (
                <div key={message.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {message.senderName}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Message */}
          {canSendMessages && (
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje para toda la familia..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={() => handleSendMessage('forum')}
                  disabled={sendMessageMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminSuggestions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Sugerencias para el administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {adminSuggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay sugerencias aún.
              </p>
            ) : (
              adminSuggestions.map((message) => (
                <div key={message.id} className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {message.senderName}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Suggestion */}
          {canSendMessages && (
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu sugerencia para mejorar la organización familiar..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={() => handleSendMessage('admin_suggestion')}
                  disabled={sendMessageMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivateMessages = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Mensajes privados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipient Selection */}
          {canSendMessages && (
            <div className="border-b pb-4">
              <label className="block text-sm font-medium mb-2">
                Seleccionar destinatario:
              </label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige a quién escribir..." />
                </SelectTrigger>
                <SelectContent>
                  {FAMILY_USERS
                    .filter(user => user.value !== currentUser)
                    .map((user) => (
                      <SelectItem key={user.value} value={user.value}>
                        {user.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Messages List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {privateMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tienes mensajes privados.
              </p>
            ) : (
              privateMessages.map((message) => (
                <div key={message.id} className={`rounded-lg p-4 ${
                  message.senderName === currentUser 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-purple-50 mr-8'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {message.senderName === currentUser ? 'Tú' : message.senderName}
                      {message.senderName !== currentUser && (
                        <span className="ml-1">→ {message.recipientName}</span>
                      )}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Private Message */}
          {canSendMessages && (
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedRecipient ? `Escribe un mensaje privado para ${selectedRecipient}...` : "Selecciona un destinatario primero..."}
                  className="flex-1"
                  rows={2}
                  disabled={!selectedRecipient}
                />
                <Button
                  onClick={() => handleSendMessage('private', selectedRecipient)}
                  disabled={sendMessageMutation.isPending || !selectedRecipient}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mensajes</h2>
        <p className="text-gray-600">Comunícate con la familia</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Foro Público
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sugerencias
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Privados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="mt-6">
          {renderForumMessages()}
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          {renderAdminSuggestions()}
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          {renderPrivateMessages()}
        </TabsContent>
      </Tabs>

      {!canSendMessages && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Solo puedes leer mensajes. Para enviar mensajes, contacta al administrador.
            </p>
          </CardContent>
        </Card>
      )}

      {userRole === 'javi_administrador' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Panel de Administrador</h3>
            </div>
            <p className="text-blue-800 text-sm mb-3">
              Como administrador, puedes ver y gestionar todos los mensajes de la familia.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">
                Foro: {forumMessages.length} mensajes
              </Badge>
              <Badge variant="outline">
                Sugerencias: {adminSuggestions.length} mensajes
              </Badge>
              <Badge variant="outline">
                Privados: {privateMessages.length} mensajes
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
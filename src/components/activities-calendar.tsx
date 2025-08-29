import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ActivityModal from "@/components/activity-modal";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  Circle,
  Edit2,
  Eye
} from "lucide-react";
import type { Activity } from "@shared/schema";

// User profiles configuration
const USER_PROFILES = [
  { id: 'javier', name: 'Javier', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'raquel', name: 'Raquel', color: 'bg-pink-500', textColor: 'text-pink-700' },
  { id: 'mario', name: 'Mario', color: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'alba', name: 'Alba', color: 'bg-purple-500', textColor: 'text-purple-700' },
];

// Helper functions for date manipulation
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getWeekDates = (startDate: Date): Date[] => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};

const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Activity Details Modal for viewing/editing existing activities
interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const ActivityDetailsModal = ({ isOpen, onClose, activity }: ActivityDetailsModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      return await apiRequest('PUT', `/api/activities/${id}/complete`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Actividad actualizada",
        description: "El estado de la actividad se ha actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la actividad",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado exitosamente",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la actividad",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = () => {
    if (activity) {
      completeMutation.mutate({
        id: activity.id,
        isCompleted: !activity.isCompleted,
      });
    }
  };

  const handleDelete = () => {
    if (activity && window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      deleteMutation.mutate(activity.id);
    }
  };

  if (!isOpen || !activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="activity-details-modal">
        <DialogHeader>
          <DialogTitle>Detalles de Actividad</DialogTitle>
          <DialogDescription>
            Creada el {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Fecha no disponible'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Título</Label>
            <p className="text-sm text-gray-600 mt-1">{activity.title}</p>
          </div>
          
          {activity.description && (
            <div>
              <Label className="text-sm font-medium">Descripción</Label>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Fecha</Label>
              <p className="text-sm text-gray-600 mt-1">{activity.date}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Hora</Label>
              <p className="text-sm text-gray-600 mt-1">{activity.time}</p>
            </div>
          </div>
          
          {activity.durationMinutes && (
            <div>
              <Label className="text-sm font-medium">Duración</Label>
              <p className="text-sm text-gray-600 mt-1">{activity.durationMinutes} minutos</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Asignado a</Label>
              <p className="text-sm text-gray-600 mt-1 capitalize">{activity.assignedTo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Categoría</Label>
              <p className="text-sm text-gray-600 mt-1 capitalize">{activity.category}</p>
            </div>
          </div>
          
          {activity.isRecurring && (
            <div>
              <Label className="text-sm font-medium">Repetición</Label>
              <p className="text-sm text-gray-600 mt-1">
                {activity.recurringType === 'daily' && 'Todos los días'}
                {activity.recurringType === 'weekly' && 'Semanalmente'}
                {activity.recurringType === 'custom' && 'Días específicos'}
                {activity.recurringEndDate && ` hasta ${activity.recurringEndDate}`}
              </p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium">Estado</Label>
            <p className="text-sm text-gray-600 mt-1">
              {activity.isCompleted ? 'Completada' : 'Pendiente'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-close"
          >
            Cerrar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleToggleComplete}
            disabled={completeMutation.isPending}
            data-testid="button-toggle-complete"
          >
            {activity.isCompleted ? 'Marcar pendiente' : 'Marcar completada'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid="button-delete"
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Daily View Component
const DailyView = ({ 
  currentDate, 
  selectedUser, 
  activities, 
  onActivityClick, 
  onDateClick 
}: {
  currentDate: Date;
  selectedUser: string;
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onDateClick: (date: string, user: string) => void;
}) => {
  const dayActivities = activities.filter(
    activity => 
      activity.assignedTo === selectedUser && 
      activity.date === formatDate(currentDate)
  ).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {currentDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dayActivities.length === 0 ? (
            <>
              <p className="text-gray-500 text-center py-8">
                No hay actividades programadas para este día
              </p>
              <Button
                variant="outline"
                onClick={() => onDateClick(formatDate(currentDate), selectedUser)}
                className="w-full"
                data-testid="button-add-first-activity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar primera actividad
              </Button>
            </>
          ) : (
            <>
              {dayActivities.map((activity) => (
                <Card 
                  key={activity.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    activity.isCompleted ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => onActivityClick(activity)}
                  data-testid={`activity-card-${activity.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{activity.time}</span>
                          {activity.durationMinutes && (
                            <span className="text-xs text-gray-500">
                              ({activity.durationMinutes}min)
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        {activity.isRecurring && (
                          <Badge variant="outline" className="text-xs mt-2">
                            Se repite
                          </Badge>
                        )}
                      </div>
                      <div className="ml-4">
                        {activity.isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateClick(formatDate(currentDate), selectedUser)}
                className="w-full"
                data-testid="button-add-more-activities"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar otra actividad
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Weekly View Component
const WeeklyView = ({ 
  currentDate, 
  selectedUser, 
  activities, 
  onActivityClick, 
  onDateClick 
}: {
  currentDate: Date;
  selectedUser: string;
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onDateClick: (date: string, user: string) => void;
}) => {
  const monday = getMonday(new Date(currentDate));
  const weekDates = getWeekDates(monday);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Semana del {monday.getDate()} al {addDays(monday, 6).getDate()} de {
            monday.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dayActivities = activities.filter(
              activity => 
                activity.assignedTo === selectedUser && 
                activity.date === formatDate(date)
            ).sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={formatDate(date)} className="border rounded-lg p-3 min-h-[200px]">
                <div className="text-center mb-2">
                  <div className="text-xs font-medium text-gray-600">
                    {DAYS_OF_WEEK[index]}
                  </div>
                  <div className="text-lg font-semibold">
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${
                        activity.isCompleted 
                          ? 'bg-green-100 border border-green-200' 
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                      onClick={() => onActivityClick(activity)}
                      data-testid={`week-activity-${activity.id}`}
                    >
                      <div className="font-medium truncate">{activity.title}</div>
                      <div className="text-gray-600">
                        {activity.time}
                        {activity.durationMinutes && (
                          <span className="ml-1">({activity.durationMinutes}min)</span>
                        )}
                      </div>
                      {activity.isCompleted && (
                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateClick(formatDate(date), selectedUser)}
                    className="w-full h-6 text-xs mt-2"
                    data-testid={`add-activity-${formatDate(date)}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivitiesCalendarProps {
  userRole: string;
  currentUser: string;
  canAddActivities: boolean;
  canMarkCompleted: boolean;
}

export default function ActivitiesCalendar({ 
  userRole, 
  currentUser: propCurrentUser, 
  canAddActivities, 
  canMarkCompleted 
}: ActivitiesCalendarProps) {
  const [selectedUser, setSelectedUser] = useState(propCurrentUser || 'javier');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Fetch activities based on user permissions
  const { data: allActivities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  // Filter activities based on user role
  const activities = userRole === 'javi_administrador' 
    ? allActivities 
    : allActivities.filter(activity => activity.assignedTo === selectedUser);

  const handlePreviousDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setDetailsModalOpen(true);
  };

  const handleDateClick = (date: string, user: string) => {
    setNewActivityModalOpen(true);
  };

  const handleNewActivity = () => {
    setNewActivityModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Calendario de Actividades</h2>
          <p className="text-neutral-600">Gestiona las actividades con duración y repetición</p>
        </div>
        {canAddActivities && (
          <Button 
            onClick={handleNewActivity}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-new-activity"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Actividad
          </Button>
        )}
      </div>

      {/* User tabs - only show for admin */}
      {userRole === 'javi_administrador' && (
        <Tabs value={selectedUser} onValueChange={setSelectedUser}>
          <TabsList className="grid w-full grid-cols-4">
            {USER_PROFILES.map((user) => (
              <TabsTrigger 
                key={user.id} 
                value={user.id} 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid={`tab-user-${user.id}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.color}`}></div>
                  {user.name}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* User info for non-admin users */}
      {userRole !== 'javi_administrador' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${USER_PROFILES.find(u => u.id === selectedUser)?.color || 'bg-blue-500'}`}></div>
            <span className="font-medium text-blue-800">
              Viendo actividades de: {USER_PROFILES.find(u => u.id === selectedUser)?.name || selectedUser}
            </span>
          </div>
        </div>
      )}

      {/* Content based on user role */}
      {userRole === 'javi_administrador' ? (
        <Tabs value={selectedUser} onValueChange={setSelectedUser}>
          {USER_PROFILES.map((user) => (
            <TabsContent key={user.id} value={user.id} className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousDate}
                  data-testid="button-previous-date"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDate}
                  data-testid="button-next-date"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  data-testid="button-today"
                >
                  Hoy
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('daily')}
                  data-testid="button-daily-view"
                >
                  Día
                </Button>
                <Button
                  variant={viewMode === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('weekly')}
                  data-testid="button-weekly-view"
                >
                  Semana
                </Button>
              </div>
            </div>

            {/* Calendar Views */}
            {viewMode === 'daily' ? (
              <DailyView
                currentDate={currentDate}
                selectedUser={selectedUser}
                activities={activities}
                onActivityClick={handleActivityClick}
                onDateClick={handleDateClick}
              />
            ) : (
              <WeeklyView
                currentDate={currentDate}
                selectedUser={selectedUser}
                activities={activities}
                onActivityClick={handleActivityClick}
                onDateClick={handleDateClick}
              />
            )}
          </TabsContent>
        ))}
        </Tabs>
      ) : (
        // Non-admin users see only their own activities
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousDate}
                data-testid="button-previous-date"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDate}
                data-testid="button-next-date"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                data-testid="button-today"
              >
                Hoy
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('daily')}
                data-testid="button-daily-view"
              >
                Día
              </Button>
              <Button
                variant={viewMode === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('weekly')}
                data-testid="button-weekly-view"
              >
                Semana
              </Button>
            </div>
          </div>

          {/* Calendar Views */}
          {viewMode === 'daily' ? (
            <DailyView
              currentDate={currentDate}
              selectedUser={selectedUser}
              activities={activities}
              onActivityClick={handleActivityClick}
              onDateClick={canAddActivities ? handleDateClick : () => {}}
            />
          ) : (
            <WeeklyView
              currentDate={currentDate}
              selectedUser={selectedUser}
              activities={activities}
              onActivityClick={handleActivityClick}
              onDateClick={canAddActivities ? handleDateClick : () => {}}
            />
          )}
        </div>
      )}

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
      />

      {/* New Activity Modal */}
      {newActivityModalOpen && (
        <ActivityModal onClose={() => setNewActivityModalOpen(false)} />
      )}
    </div>
  );
}
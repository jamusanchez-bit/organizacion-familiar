import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Check, X } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ActivityModal from "@/components/activity-modal";
import type { Activity } from "@shared/schema";
import type { UserRole } from "@/utils/userPermissions";

interface ActivitiesCalendarProps {
  userRole: UserRole;
  currentUser: string;
  canAddActivities: boolean;
  canMarkCompleted: boolean;
}

type ViewMode = 'daily' | 'weekly';

const USER_COLORS = {
  javier: 'bg-blue-100 border-blue-300 text-blue-800',
  raquel: 'bg-pink-100 border-pink-300 text-pink-800',
  mario: 'bg-green-100 border-green-300 text-green-800',
  alba: 'bg-purple-100 border-purple-300 text-purple-800',
};

export default function ActivitiesCalendarImproved({ 
  userRole, 
  currentUser, 
  canAddActivities, 
  canMarkCompleted 
}: ActivitiesCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedUser, setSelectedUser] = useState<string>(userRole === 'javi_administrador' ? 'all' : currentUser);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    staleTime: 30000,
  });

  // Filter activities based on user permissions and selected filters
  const filteredActivities = activities.filter(activity => {
    // If not admin, only show user's own activities
    if (userRole !== 'javi_administrador' && activity.assignedTo !== currentUser) {
      return false;
    }
    
    // If admin has selected a specific user, filter by that user
    if (selectedUser !== 'all' && activity.assignedTo !== selectedUser) {
      return false;
    }
    
    // Filter by date range based on view mode
    const activityDate = parseISO(activity.date);
    if (viewMode === 'daily') {
      return isSameDay(activityDate, selectedDate);
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return activityDate >= weekStart && activityDate <= weekEnd;
    }
  });

  // Toggle activity completion
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const response = await apiRequest("PUT", `/api/activities/${id}/complete`, { isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Actividad actualizada",
        description: "El estado de la actividad se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Tu sesión ha expirado. Inicia sesión nuevamente.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompletion = (activity: Activity) => {
    if (!canMarkCompleted) return;
    toggleCompletionMutation.mutate({
      id: activity.id,
      isCompleted: !activity.isCompleted
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'daily') {
      setSelectedDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
    } else {
      setSelectedDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
    }
  };

  const getDateRangeText = () => {
    if (viewMode === 'daily') {
      return format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, "d 'de' MMM", { locale: es })} - ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: es })}`;
    }
  };

  const renderDailyView = () => {
    const dayActivities = filteredActivities.sort((a, b) => a.time.localeCompare(b.time));
    
    return (
      <div className="space-y-4">
        {dayActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividades programadas para este día</p>
          </div>
        ) : (
          dayActivities.map((activity) => (
            <Card key={activity.id} className={`border-l-4 ${USER_COLORS[activity.assignedTo as keyof typeof USER_COLORS] || 'border-gray-300'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {activity.assignedTo}
                      </Badge>
                      {activity.durationMinutes && (
                        <Badge variant="outline" className="text-xs">
                          {activity.durationMinutes} min
                        </Badge>
                      )}
                    </div>
                    <h3 className={`font-semibold ${activity.isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    )}
                  </div>
                  {canMarkCompleted && (activity.assignedTo === currentUser || userRole === 'javi_administrador') && (
                    <Button
                      variant={activity.isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCompletion(activity)}
                      className={activity.isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {activity.isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayActivities = filteredActivities
            .filter(activity => isSameDay(parseISO(activity.date), day))
            .sort((a, b) => a.time.localeCompare(b.time));
          
          return (
            <Card key={day.toISOString()} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-center">
                  {format(day, "EEE", { locale: es })}
                  <br />
                  <span className="text-lg">{format(day, "d")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-2 rounded text-xs border ${USER_COLORS[activity.assignedTo as keyof typeof USER_COLORS] || 'bg-gray-100'} ${
                      activity.isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{activity.time}</span>
                      {canMarkCompleted && (activity.assignedTo === currentUser || userRole === 'javi_administrador') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleToggleCompletion(activity)}
                        >
                          {activity.isCompleted ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className={`font-medium ${activity.isCompleted ? 'line-through' : ''}`}>
                      {activity.title}
                    </p>
                    <p className="text-xs opacity-75">{activity.assignedTo}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Actividades</h2>
          <p className="text-gray-600">{getDateRangeText()}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* User Filter (Admin only) */}
          {userRole === 'javi_administrador' && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todos los usuarios</option>
              <option value="javier">Javier</option>
              <option value="raquel">Raquel</option>
              <option value="mario">Mario</option>
              <option value="alba">Alba</option>
            </select>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('daily')}
              className="rounded-none"
            >
              Diario
            </Button>
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('weekly')}
              className="rounded-none"
            >
              Semanal
            </Button>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add Activity Button (Admin only) */}
          {canAddActivities && (
            <Button size="sm" onClick={() => setShowActivityModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'daily' ? renderDailyView() : renderWeeklyView()}
      
      {/* Activity Modal */}
      {showActivityModal && (
        <ActivityModal 
          onClose={() => setShowActivityModal(false)}
          userRole={userRole}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
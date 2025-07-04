
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalShopStatus from "@/components/GlobalShopStatus";
import DaySchedule from "@/components/DaySchedule";
import ScheduleOverview from "@/components/ScheduleOverview";
import colors from "@/theme/colors";
import { useSchedules, useUpdateSchedule, useGlobalShopStatus, useUpdateGlobalShopStatus, Schedule } from "@/hooks/useSchedules";

interface TimeBlockData {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayScheduleData {
  day: string;
  isClosed: boolean;
  is24h: boolean;
  timeBlocks: TimeBlockData[];
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const Schedules = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: globalStatus, isLoading: statusLoading } = useGlobalShopStatus();
  const updateScheduleMutation = useUpdateSchedule();
  const updateGlobalStatusMutation = useUpdateGlobalShopStatus();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Convert backend schedules to frontend format
  const [frontendSchedules, setFrontendSchedules] = useState<DayScheduleData[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (schedules.length > 0) {
      const converted = DAYS.map((day, index) => {
        // Map Monday=0 to day_of_week where Monday=1, Sunday=0
        const dayOfWeek = index === 6 ? 0 : index + 1;
        const schedule = schedules.find(s => s.day_of_week === dayOfWeek);
        
        return {
          day,
          isClosed: schedule?.is_closed || false,
          is24h: schedule?.is_24h || false,
          timeBlocks: schedule?.time_blocks || [{ id: `${day}-1`, startTime: "09:00", endTime: "21:00" }]
        };
      });
      setFrontendSchedules(converted);
    }
  }, [schedules]);

  const getActiveTab = () => {
    if (location.pathname.includes('/overview')) return 'overview';
    if (location.pathname.includes('/edit')) return 'editor';
    return 'overview';
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      navigate('/admin/schedules/overview');
    } else if (tab === 'editor') {
      navigate('/admin/schedules/edit');
    }
  };

  const updateDaySchedule = (dayIndex: number, updates: Partial<DayScheduleData>) => {
    setFrontendSchedules(prev => prev.map((schedule, index) => 
      index === dayIndex ? { ...schedule, ...updates } : schedule
    ));
  };

  const validateSchedules = () => {
    const warnings: string[] = [];
    
    frontendSchedules.forEach((schedule, index) => {
      if (!schedule.isClosed && !schedule.is24h && schedule.timeBlocks.length === 0) {
        warnings.push(`${schedule.day}: No time blocks defined`);
      }
      
      schedule.timeBlocks.forEach((block, blockIndex) => {
        const start = block.startTime;
        const end = block.endTime;
        
        if (start >= end) {
          warnings.push(`${schedule.day}: Block ${blockIndex + 1} has invalid time range`);
        }
      });
    });
    
    return warnings;
  };

  const handleSave = async () => {
    const warnings = validateSchedules();
    
    if (warnings.length > 0) {
      toast.error("Schedule validation failed", {
        description: warnings.join(", ")
      });
      return;
    }
    
    // Save each schedule to backend
    for (let i = 0; i < frontendSchedules.length; i++) {
      const frontendSchedule = frontendSchedules[i];
      // Map frontend day index to backend day_of_week
      const dayOfWeek = i === 6 ? 0 : i + 1; // Sunday=0, Monday=1, etc.
      const backendSchedule = schedules.find(s => s.day_of_week === dayOfWeek);
      
      if (backendSchedule) {
        await updateScheduleMutation.mutateAsync({
          id: backendSchedule.id,
          is_closed: frontendSchedule.isClosed,
          is_24h: frontendSchedule.is24h,
          time_blocks: frontendSchedule.timeBlocks
        });
      }
    }
    
    toast.success("Shop schedule saved successfully!");
  };

  const scrollToDay = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    navigate('/admin/schedules/edit');
    
    setTimeout(() => {
      const element = document.getElementById(`day-schedule-${dayIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };

  if (schedulesLoading || statusLoading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="text-center py-8">Loading schedules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-6 ml-0 md:ml-0 min-w-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Schedule Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your shop's operating hours and availability</p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {globalStatus && (
            <GlobalShopStatus 
              status={globalStatus}
              onStatusChange={(newStatus) => updateGlobalStatusMutation.mutate(newStatus)}
            />
          )}
          
          <div className="w-full">
            <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto mb-4">
                <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs md:text-sm p-2 md:p-3">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Weekly Schedule</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-1 sm:gap-2 text-xs md:text-sm p-2 md:p-3">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Schedule Editor</span>
                  <span className="sm:hidden">Editor</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <ScheduleOverview 
                  schedules={frontendSchedules}
                  onEditDay={scrollToDay}
                />
              </TabsContent>
              
              <TabsContent value="editor" className="mt-0 space-y-4 md:space-y-6">
                <Card style={{ backgroundColor: colors.backgrounds.card }}>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Clock className="h-5 w-5" />
                      Schedule Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-3 md:space-y-4">
                      {frontendSchedules.map((schedule, index) => (
                        <div 
                          key={schedule.day}
                          id={`day-schedule-${index}`}
                          className="transition-all duration-200"
                        >
                          <DaySchedule
                            schedule={schedule}
                            onUpdate={(updates) => updateDaySchedule(index, updates)}
                          />
                        </div>
                      ))}
                    </div>

                    {validateSchedules().length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 md:p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-medium text-yellow-800 text-sm md:text-base">Schedule Warnings</h4>
                            <ul className="mt-1 text-xs md:text-sm text-yellow-700 list-disc list-inside space-y-1">
                              {validateSchedules().map((warning, index) => (
                                <li key={index} className="break-words">{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleSave}
                      style={{ backgroundColor: colors.primary[500] }}
                      className="w-full h-10 md:h-11 text-sm md:text-base mt-4"
                      disabled={updateScheduleMutation.isPending}
                    >
                      Save Schedule
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedules;

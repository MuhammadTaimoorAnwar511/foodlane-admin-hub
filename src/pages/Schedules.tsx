
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
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const [schedules, setSchedules] = useState<DayScheduleData[]>(() => {
    const saved = localStorage.getItem("shopSchedules");
    if (saved) {
      return JSON.parse(saved);
    }
    return DAYS.map(day => ({
      day,
      isClosed: false,
      is24h: false,
      timeBlocks: [{ id: `${day}-1`, startTime: "09:00", endTime: "21:00" }]
    }));
  });

  const [globalStatus, setGlobalStatus] = useState(() => {
    const saved = localStorage.getItem("globalShopStatus");
    return saved ? JSON.parse(saved) : {
      isOpen: true,
      closedMessage: "We're temporarily closed. Please check back later!"
    };
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Determine active tab based on URL
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

  useEffect(() => {
    localStorage.setItem("shopSchedules", JSON.stringify(schedules));
  }, [schedules]);

  const updateDaySchedule = (dayIndex: number, updates: Partial<DayScheduleData>) => {
    setSchedules(prev => prev.map((schedule, index) => 
      index === dayIndex ? { ...schedule, ...updates } : schedule
    ));
  };

  const validateSchedules = () => {
    const warnings = [];
    
    schedules.forEach((schedule, index) => {
      if (!schedule.isClosed && !schedule.is24h && schedule.timeBlocks.length === 0) {
        warnings.push(`${schedule.day}: No time blocks defined`);
      }
      
      schedule.timeBlocks.forEach((block, blockIndex) => {
        const start = block.startTime;
        const end = block.endTime;
        
        if (start >= end) {
          warnings.push(`${schedule.day}: Block ${blockIndex + 1} has invalid time range`);
        }
        
        if (start > "22:00" && end < "06:00") {
          warnings.push(`${schedule.day}: Block ${blockIndex + 1} spans overnight`);
        }
      });
    });
    
    return warnings;
  };

  const handleSave = () => {
    const warnings = validateSchedules();
    
    if (warnings.length > 0) {
      toast.error("Schedule validation failed", {
        description: warnings.join(", ")
      });
      return;
    }
    
    localStorage.setItem("shopSchedules", JSON.stringify(schedules));
    localStorage.setItem("globalShopStatus", JSON.stringify(globalStatus));
    toast.success("Shop schedule saved successfully!");
  };

  const scrollToDay = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    navigate('/admin/schedules/edit');
    
    // Wait for navigation then scroll
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

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-6 ml-0 md:ml-0 min-w-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Schedule Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your shop's operating hours and availability</p>
        </div>

        <div className="space-y-4 md:space-y-6">
          <GlobalShopStatus 
            status={globalStatus}
            onStatusChange={setGlobalStatus}
          />
          
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
                  schedules={schedules}
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
                      {schedules.map((schedule, index) => (
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

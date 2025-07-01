
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Clock, Calendar, AlertTriangle } from "lucide-react";
import DaySchedule from "./DaySchedule";
import GlobalShopStatus from "./GlobalShopStatus";
import ScheduleOverview from "./ScheduleOverview";
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

const ShopSchedule = () => {
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
        
        // Check for overnight spans
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
    const element = document.getElementById(`day-schedule-${dayIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the selected day briefly
      element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <GlobalShopStatus 
        status={globalStatus}
        onStatusChange={setGlobalStatus}
      />
      
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Shop Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Schedule Overview
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule Editor
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <ScheduleOverview 
                schedules={schedules}
                onEditDay={scrollToDay}
              />
            </TabsContent>
            
            <TabsContent value="editor" className="mt-6 space-y-6">
              {/* Day Schedules */}
              <div className="space-y-4">
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

              {/* Validation Warnings */}
              {validateSchedules().length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Schedule Warnings</h4>
                      <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                        {validateSchedules().map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSave}
                style={{ backgroundColor: colors.primary[500] }}
                className="w-full"
              >
                Save Schedule
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSchedule;

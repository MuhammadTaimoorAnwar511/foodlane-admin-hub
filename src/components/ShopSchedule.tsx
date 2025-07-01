
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, Plus, AlertTriangle } from "lucide-react";
import DaySchedule from "./DaySchedule";
import GlobalShopStatus from "./GlobalShopStatus";
import colors from "@/theme/colors";

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  isClosed: boolean;
  is24h: boolean;
  timeBlocks: TimeBlock[];
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const ShopSchedule = () => {
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
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

  useEffect(() => {
    localStorage.setItem("shopSchedules", JSON.stringify(schedules));
  }, [schedules]);

  const updateDaySchedule = (dayIndex: number, updates: Partial<DaySchedule>) => {
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

  const getDayStatus = (schedule: DaySchedule) => {
    if (schedule.isClosed) return { label: "Closed", color: "bg-red-100 text-red-800" };
    if (schedule.is24h) return { label: "24/7", color: "bg-green-100 text-green-800" };
    return { label: "Open", color: "bg-blue-100 text-blue-800" };
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
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Summary */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {schedules.map((schedule, index) => {
              const status = getDayStatus(schedule);
              return (
                <div key={schedule.day} className="text-center">
                  <div className="text-sm font-medium mb-1">
                    {schedule.day.slice(0, 3)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day Schedules */}
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <DaySchedule
                key={schedule.day}
                schedule={schedule}
                onUpdate={(updates) => updateDaySchedule(index, updates)}
              />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSchedule;

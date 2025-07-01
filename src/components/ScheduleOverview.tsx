
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar, Eye } from "lucide-react";
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

interface ScheduleOverviewProps {
  schedules: DayScheduleData[];
  onEditDay: (dayIndex: number) => void;
}

const ScheduleOverview = ({ schedules, onEditDay }: ScheduleOverviewProps) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100;
  };

  const getDayStatus = (schedule: DayScheduleData) => {
    if (schedule.isClosed) {
      return {
        status: 'closed',
        label: 'Closed',
        color: 'bg-red-100 text-red-800 border-red-200',
        bgColor: 'bg-red-50'
      };
    }
    if (schedule.is24h) {
      return {
        status: '24h',
        label: '24/7',
        color: 'bg-green-100 text-green-800 border-green-200',
        bgColor: 'bg-green-50'
      };
    }
    const hasMultipleBlocks = schedule.timeBlocks.length > 1;
    return {
      status: hasMultipleBlocks ? 'split' : 'open',
      label: hasMultipleBlocks ? 'Split Shift' : 'Open',
      color: hasMultipleBlocks 
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      bgColor: hasMultipleBlocks ? 'bg-yellow-50' : 'bg-blue-50'
    };
  };

  const renderTimelineBar = (schedule: DayScheduleData) => {
    if (schedule.isClosed) {
      return (
        <div className="h-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">CLOSED</span>
        </div>
      );
    }

    if (schedule.is24h) {
      return (
        <div className="h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-xs text-white font-bold">24/7 OPEN</span>
        </div>
      );
    }

    // Sort time blocks by start time
    const sortedBlocks = [...schedule.timeBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        {/* Render blue bars for working hours */}
        {sortedBlocks.map((block, index) => {
          const startPos = getTimePosition(block.startTime);
          const endPos = getTimePosition(block.endTime);
          const width = endPos - startPos;
          
          return (
            <div
              key={block.id}
              className="absolute h-full bg-blue-500 shadow-sm"
              style={{
                left: `${startPos}%`,
                width: `${width}%`,
              }}
            >
              <div className="h-full flex items-center justify-center px-1">
                <span className="text-xs text-white font-medium truncate">
                  {formatTime12h(block.startTime)} - {formatTime12h(block.endTime)}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Render yellow bars for breaks between shifts */}
        {sortedBlocks.length > 1 && sortedBlocks.slice(0, -1).map((block, index) => {
          const currentEndPos = getTimePosition(block.endTime);
          const nextStartPos = getTimePosition(sortedBlocks[index + 1].startTime);
          const breakWidth = nextStartPos - currentEndPos;
          
          // Only render break if there's a significant gap (more than 1% of the day)
          if (breakWidth > 1) {
            return (
              <div
                key={`break-${index}`}
                className="absolute h-full bg-yellow-400 shadow-sm flex items-center justify-center"
                style={{
                  left: `${currentEndPos}%`,
                  width: `${breakWidth}%`,
                }}
              >
                <span className="text-xs text-yellow-900 font-medium">
                  BREAK
                </span>
              </div>
            );
          }
          return null;
        })}
        
        {/* Hour markers */}
        <div className="absolute inset-0 flex pointer-events-none">
          {[0, 6, 12, 18, 24].map(hour => (
            <div
              key={hour}
              className="absolute h-full border-l border-gray-300 opacity-30"
              style={{ left: `${(hour / 24) * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  const getDetailedSchedule = (schedule: DayScheduleData) => {
    if (schedule.isClosed) return "Closed all day";
    if (schedule.is24h) return "Open 24 hours";
    
    return schedule.timeBlocks
      .map(block => `${formatTime12h(block.startTime)} - ${formatTime12h(block.endTime)}`)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
          <div className="w-3 h-2 bg-blue-500 rounded-sm mr-2"></div>
          Working Hours
        </Badge>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <div className="w-3 h-2 bg-yellow-400 rounded-sm mr-2"></div>
          Break
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
          <div className="w-3 h-2 bg-green-500 rounded-sm mr-2"></div>
          24/7
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
          <div className="w-3 h-2 bg-gray-300 rounded-sm mr-2 border-dashed border"></div>
          Closed
        </Badge>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-4">
        {schedules.map((schedule, index) => {
          const status = getDayStatus(schedule);
          
          return (
            <Popover key={schedule.day}>
              <PopoverTrigger asChild>
                <div 
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${status.bgColor} hover:scale-[1.02] group`}
                  onMouseEnter={() => setHoveredDay(schedule.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{schedule.day}</h3>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDay(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {renderTimelineBar(schedule)}
                  
                  {/* Time markers */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>12 AM</span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">{schedule.day} Schedule</h4>
                  <p className="text-sm text-gray-600">
                    {getDetailedSchedule(schedule)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                    <Clock className="h-3 w-3" />
                    Click the eye icon to edit this day's schedule
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Mobile/Tablet View */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schedules.map((schedule, index) => {
          const status = getDayStatus(schedule);
          
          return (
            <div
              key={schedule.day}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${status.bgColor} group`}
              onClick={() => onEditDay(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{schedule.day.slice(0, 3)}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${status.color}`}>
                    {status.label}
                  </Badge>
                  <Eye className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                {getDetailedSchedule(schedule)}
              </div>
              
              <div className="h-3">
                {renderTimelineBar(schedule)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600">
            {schedules.filter(s => !s.isClosed && !s.is24h).length}
          </div>
          <div className="text-xs text-gray-500">Regular Days</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">
            {schedules.filter(s => s.is24h).length}
          </div>
          <div className="text-xs text-gray-500">24/7 Days</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-600">
            {schedules.filter(s => s.isClosed).length}
          </div>
          <div className="text-xs text-gray-500">Closed Days</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-600">
            {schedules.filter(s => s.timeBlocks.length > 1).length}
          </div>
          <div className="text-xs text-gray-500">Split Shifts</div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleOverview;


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderTimelineBar = (schedule: DayScheduleData) => {
    if (schedule.isClosed) {
      return (
        <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500 font-medium">Closed</span>
        </div>
      );
    }

    if (schedule.is24h) {
      return (
        <div className="w-full h-12 bg-blue-500 rounded-lg flex items-center justify-center relative">
          <span className="text-sm text-white font-medium">24/7</span>
        </div>
      );
    }

    if (schedule.timeBlocks.length === 0) {
      return (
        <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500 font-medium">No hours set</span>
        </div>
      );
    }

    // Sort time blocks by start time
    const sortedBlocks = [...schedule.timeBlocks].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    // Get the main time block for display
    const mainBlock = sortedBlocks[0];
    const timeText = `${formatTime(mainBlock.startTime)} - ${formatTime(mainBlock.endTime)}`;

    return (
      <div className="w-full h-12 bg-gray-200 rounded-lg relative overflow-hidden">
        {sortedBlocks.map((block, index) => {
          const startMinutes = timeToMinutes(block.startTime);
          const endMinutes = timeToMinutes(block.endTime);
          const left = (startMinutes / 1440) * 100; // 1440 minutes in a day
          const width = ((endMinutes - startMinutes) / 1440) * 100;

          return (
            <div
              key={block.id}
              className="absolute h-full bg-blue-500 flex items-center justify-center"
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
            >
              {index === 0 && (
                <span className="text-xs text-white font-medium px-2 truncate">
                  {timeText}
                </span>
              )}
            </div>
          );
        })}
        
        {/* Show gaps as light gray for multiple blocks */}
        {sortedBlocks.length > 1 && sortedBlocks.slice(0, -1).map((block, index) => {
          const currentEnd = timeToMinutes(block.endTime);
          const nextStart = timeToMinutes(sortedBlocks[index + 1].startTime);
          
          if (nextStart > currentEnd) {
            const left = (currentEnd / 1440) * 100;
            const width = ((nextStart - currentEnd) / 1440) * 100;
            
            return (
              <div
                key={`break-${index}`}
                className="absolute h-full bg-gray-300"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
              />
            );
          }
          return null;
        })}
      </div>
    );
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getScheduleText = (schedule: DayScheduleData) => {
    if (schedule.isClosed) return "Closed";
    if (schedule.is24h) return "Open 24 hours";
    if (schedule.timeBlocks.length === 0) return "No hours set";

    const sortedBlocks = [...schedule.timeBlocks].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    return sortedBlocks
      .map(block => `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.day}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer gap-4"
                onClick={() => onEditDay(index)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 flex-1">
                  <div className="w-full sm:w-20 text-sm font-medium text-gray-700">
                    {schedule.day}
                  </div>
                  <div className="flex-1 max-w-none sm:max-w-md">
                    {renderTimelineBar(schedule)}
                  </div>
                  <div className="text-sm text-gray-600 min-w-0 flex-1 sm:hidden">
                    {getScheduleText(schedule)}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end">
                  <div className="hidden sm:block text-sm text-gray-600 min-w-0 flex-1 mr-4">
                    {getScheduleText(schedule)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-70 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDay(index);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleOverview;

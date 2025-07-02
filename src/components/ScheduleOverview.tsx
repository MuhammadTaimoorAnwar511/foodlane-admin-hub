
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
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
        <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-sm text-gray-500">Closed</span>
        </div>
      );
    }

    if (schedule.is24h) {
      return (
        <div className="w-full h-8 bg-green-500 rounded flex items-center justify-center">
          <span className="text-sm text-white font-medium">24/7</span>
        </div>
      );
    }

    if (schedule.timeBlocks.length === 0) {
      return (
        <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-sm text-gray-500">No hours set</span>
        </div>
      );
    }

    // Sort time blocks by start time
    const sortedBlocks = [...schedule.timeBlocks].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    return (
      <div className="w-full h-8 bg-gray-200 rounded relative overflow-hidden">
        {sortedBlocks.map((block, index) => {
          const startMinutes = timeToMinutes(block.startTime);
          const endMinutes = timeToMinutes(block.endTime);
          const left = (startMinutes / 1440) * 100; // 1440 minutes in a day
          const width = ((endMinutes - startMinutes) / 1440) * 100;

          return (
            <div
              key={block.id}
              className="absolute h-full bg-blue-500"
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
            />
          );
        })}
        
        {/* Show gaps as yellow breaks for multiple blocks */}
        {sortedBlocks.length > 1 && sortedBlocks.slice(0, -1).map((block, index) => {
          const currentEnd = timeToMinutes(block.endTime);
          const nextStart = timeToMinutes(sortedBlocks[index + 1].startTime);
          
          if (nextStart > currentEnd) {
            const left = (currentEnd / 1440) * 100;
            const width = ((nextStart - currentEnd) / 1440) * 100;
            
            return (
              <div
                key={`break-${index}`}
                className="absolute h-full bg-yellow-400"
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
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.day}
                className="group flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onEditDay(index)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {schedule.day}
                  </div>
                  <div className="flex-1 max-w-md">
                    {renderTimelineBar(schedule)}
                  </div>
                  <div className="text-sm text-gray-600 min-w-0 flex-1">
                    {getScheduleText(schedule)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDay(index);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleOverview;

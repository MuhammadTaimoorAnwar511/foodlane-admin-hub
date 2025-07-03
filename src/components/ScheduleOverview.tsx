
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Clock, Calendar } from "lucide-react";
import colors from "@/theme/colors";

interface TimeBlockData {
  id: string;
  startTime: string;
  endTime: string;
  kind?: "work" | "break";
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

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasBreaks = (schedule: DayScheduleData) => {
    return schedule.timeBlocks.some(block => block.kind === "break");
  };

  // Generate break segments between work blocks
  const generateBreakSegments = (schedule: DayScheduleData) => {
    if (schedule.isClosed || schedule.is24h || schedule.timeBlocks.length === 0) {
      return [];
    }

    // Sort work blocks by start time
    const workBlocks = schedule.timeBlocks
      .filter(block => block.kind !== "break")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const breakSegments = [];
    
    for (let i = 0; i < workBlocks.length - 1; i++) {
      const currentEnd = workBlocks[i].endTime;
      const nextStart = workBlocks[i + 1].startTime;
      
      if (currentEnd < nextStart) {
        breakSegments.push({
          id: `break-${i}`,
          startTime: currentEnd,
          endTime: nextStart,
          kind: "break" as const
        });
      }
    }
    
    return breakSegments;
  };

  const renderTimelineBar = (schedule: DayScheduleData) => {
    if (schedule.isClosed) {
      return (
        <div className="relative h-8 rounded-md bg-slate-100/60">
          <div className="bg-red-400 rounded-md h-full w-full flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-semibold">Closed</span>
          </div>
        </div>
      );
    }

    if (schedule.is24h) {
      return (
        <div className="relative h-8 rounded-md bg-slate-100/60">
          <div className="bg-green-500 rounded-md h-full w-full flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-semibold">24/7</span>
          </div>
        </div>
      );
    }

    if (schedule.timeBlocks.length === 0) {
      return (
        <div className="relative h-8 rounded-md bg-slate-100/60">
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-500 text-xs sm:text-sm font-medium">No hours set</span>
          </div>
        </div>
      );
    }

    // Combine work blocks with auto-generated break segments
    const workBlocks = schedule.timeBlocks.filter(block => block.kind !== "break");
    const explicitBreaks = schedule.timeBlocks.filter(block => block.kind === "break");
    const autoBreaks = generateBreakSegments(schedule);
    
    const allSegments = [...workBlocks, ...explicitBreaks, ...autoBreaks].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    return (
      <div className="relative h-8 rounded-md bg-slate-100/60">
        {allSegments.map((block, index) => {
          const startMinutes = timeToMinutes(block.startTime);
          const endMinutes = timeToMinutes(block.endTime);
          const left = (startMinutes / 1440) * 100;
          const width = ((endMinutes - startMinutes) / 1440) * 100;
          
          const isBreak = block.kind === "break";
          const bgColor = isBreak ? "bg-yellow-500" : "bg-blue-600";
          const timeText = isBreak ? "BREAK" : `${formatTime(block.startTime)} – ${formatTime(block.endTime)}`;
          
          return (
            <div
              key={block.id || index}
              className={`${bgColor} rounded-md h-full absolute flex items-center justify-center`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
              title={isBreak ? `Break — ${formatTime(block.startTime)} to ${formatTime(block.endTime)}` : timeText}
            >
              <span className="text-white text-xs font-semibold px-1 truncate">
                {timeText}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusBadge = (schedule: DayScheduleData) => {
    if (schedule.isClosed) return { text: "Closed", class: "bg-red-400/10 text-red-600" };
    if (schedule.is24h) return { text: "24/7", class: "bg-green-500/10 text-green-600" };
    if (schedule.timeBlocks.length === 0) return { text: "No hours", class: "bg-slate-100 text-slate-500" };
    
    // Check for breaks (either explicit or gaps between work blocks)
    const explicitBreaks = hasBreaks(schedule);
    const autoBreaks = generateBreakSegments(schedule).length > 0;
    
    if (explicitBreaks || autoBreaks) return { text: "Split Shift", class: "bg-yellow-200 text-yellow-800" };
    return { text: "Open", class: "bg-blue-100 text-blue-700" };
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-slate-600" />
        <h2 className="font-semibold text-lg sm:text-xl ml-2">Shop Schedule</h2>
      </div>

      {/* Legend Badges */}
      <div className="flex items-center gap-1 sm:gap-2 mt-4 flex-wrap">
        <span className="bg-blue-600/10 text-blue-700 rounded-full text-xs font-semibold px-2 sm:px-3 py-1">
          Working Hours
        </span>
        <span className="bg-yellow-500/90 text-white rounded-full text-xs font-semibold px-2 sm:px-3 py-1">
          Break
        </span>
        <span className="bg-green-500/10 text-green-600 rounded-full text-xs font-semibold px-2 sm:px-3 py-1">
          24/7
        </span>
        <span className="bg-red-400/10 text-red-600 rounded-full text-xs font-semibold px-2 sm:px-3 py-1">
          Closed
        </span>
      </div>

      {/* Schedule Days */}
      <div className="space-y-3 mt-4 sm:mt-6">
        {schedules.map((schedule, index) => {
          const status = getStatusBadge(schedule);
          const explicitBreaks = hasBreaks(schedule);
          const autoBreaks = generateBreakSegments(schedule).length > 0;
          const hasSplitShift = explicitBreaks || autoBreaks;
          const rowBgColor = hasSplitShift ? "bg-yellow-50" : "bg-blue-50/50";
          
          return (
            <div
              key={schedule.day}
              className={`${rowBgColor} rounded-lg p-3 sm:p-4 relative cursor-pointer hover:bg-opacity-70 transition-colors`}
              onClick={() => onEditDay(index)}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                  <span className="font-medium text-slate-900 text-sm sm:text-base">{schedule.day}</span>
                  <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${status.class}`}>
                    {status.text}
                  </span>
                </div>
                
                {/* Edit button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDay(index);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 shadow-md cursor-pointer transition flex-shrink-0"
                  aria-label={`Edit ${schedule.day} schedule`}
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>

              {/* Timeline bar */}
              <div className="mt-3">
                {renderTimelineBar(schedule)}
                
                {/* Hour tick labels */}
                <div className="flex justify-between text-xs text-slate-500 mt-1 px-0.5">
                  <span>12 AM</span>
                  <span className="hidden sm:inline">6 AM</span>
                  <span>12 PM</span>
                  <span className="hidden sm:inline">6 PM</span>
                  <span>12 AM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleOverview;

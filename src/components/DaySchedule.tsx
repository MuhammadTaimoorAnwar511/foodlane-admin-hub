
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import TimeBlock from "./TimeBlock";

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

interface DayScheduleProps {
  schedule: DayScheduleData;
  onUpdate: (updates: Partial<DayScheduleData>) => void;
}

const DaySchedule = ({ schedule, onUpdate }: DayScheduleProps) => {
  const addTimeBlock = () => {
    const newBlock: TimeBlockData = {
      id: `${schedule.day}-${Date.now()}`,
      startTime: "09:00",
      endTime: "17:00"
    };
    
    onUpdate({
      timeBlocks: [...schedule.timeBlocks, newBlock]
    });
  };

  const updateTimeBlock = (blockId: string, updates: Partial<TimeBlockData>) => {
    onUpdate({
      timeBlocks: schedule.timeBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const removeTimeBlock = (blockId: string) => {
    onUpdate({
      timeBlocks: schedule.timeBlocks.filter(block => block.id !== blockId)
    });
  };

  const handleClosedToggle = (checked: boolean) => {
    onUpdate({
      isClosed: checked,
      is24h: checked ? false : schedule.is24h
    });
  };

  const handle24hToggle = (checked: boolean) => {
    onUpdate({
      is24h: checked,
      isClosed: checked ? false : schedule.isClosed
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{schedule.day}</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id={`closed-${schedule.day}`}
              checked={schedule.isClosed}
              onCheckedChange={handleClosedToggle}
            />
            <Label htmlFor={`closed-${schedule.day}`} className="text-sm">
              Closed
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id={`24h-${schedule.day}`}
              checked={schedule.is24h}
              onCheckedChange={handle24hToggle}
              disabled={schedule.isClosed}
            />
            <Label htmlFor={`24h-${schedule.day}`} className="text-sm">
              24/7
            </Label>
          </div>
        </div>
      </div>

      {!schedule.isClosed && !schedule.is24h && (
        <div className="space-y-3">
          {schedule.timeBlocks.map((block, index) => (
            <div key={block.id} className="flex items-center gap-3">
              <TimeBlock
                block={block}
                onUpdate={(updates) => updateTimeBlock(block.id, updates)}
              />
              
              {schedule.timeBlocks.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeTimeBlock(block.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={addTimeBlock}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Time Block
          </Button>
        </div>
      )}

      {schedule.isClosed && (
        <div className="text-center py-4 text-gray-500">
          Closed all day
        </div>
      )}

      {schedule.is24h && (
        <div className="text-center py-4 text-green-600 font-medium">
          Open 24 hours
        </div>
      )}
    </div>
  );
};

export default DaySchedule;

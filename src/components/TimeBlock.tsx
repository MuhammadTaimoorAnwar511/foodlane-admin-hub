
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

interface TimeBlockProps {
  block: TimeBlock;
  onUpdate: (updates: Partial<TimeBlock>) => void;
}

const TimeBlock = ({ block, onUpdate }: TimeBlockProps) => {
  const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTime24h = (time12: string) => {
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = formatTime12h(time24);
        options.push({ value: time24, label: `${time12} (${time24})` });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const isValidTimeRange = () => {
    return block.startTime < block.endTime;
  };

  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1">
        <Label className="text-xs text-gray-600">From</Label>
        <Select value={block.startTime} onValueChange={(value) => onUpdate({ startTime: value })}>
          <SelectTrigger className={`${!isValidTimeRange() ? 'border-red-300' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-gray-400 mt-5">to</div>

      <div className="flex-1">
        <Label className="text-xs text-gray-600">To</Label>
        <Select value={block.endTime} onValueChange={(value) => onUpdate({ endTime: value })}>
          <SelectTrigger className={`${!isValidTimeRange() ? 'border-red-300' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isValidTimeRange() && (
        <div className="text-red-500 text-xs mt-5">
          Invalid range
        </div>
      )}
    </div>
  );
};

export default TimeBlock;

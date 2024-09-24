import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  onTimeChange: (time: string) => void;
  defaultValue?: string; // Default value in "HH:mm" format (24-hour), e.g., "13:23"
}

const TimePicker: React.FC<TimePickerProps> = ({
  onTimeChange,
  defaultValue = "00:00",
}) => {
  const [hours, setHours] = useState<string>("12");
  const [minutes, setMinutes] = useState<string>("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Separate state for default value handling
  const [defaultHour, defaultMinute] = defaultValue.split(":");

  useEffect(() => {
    if (defaultValue) {
      let hourNum = parseInt(defaultHour, 10);
      if (hourNum >= 12) {
        setPeriod("PM");
        if (hourNum > 12) hourNum -= 12; // Convert to 12-hour format
      } else {
        setPeriod("AM");
        if (hourNum === 0) hourNum = 12; // Midnight is 12 AM in 12-hour format
      }
      setHours(hourNum.toString()); // No padding here
      setMinutes(defaultMinute); // No padding here
    }
  }, [defaultHour, defaultMinute, defaultValue]);

  useEffect(() => {
    // Convert the time to 24-hour format and pass it to parent via onTimeChange
    let hourNum = parseInt(hours, 10);
    if (period === "PM" && hourNum !== 12) hourNum += 12;
    if (period === "AM" && hourNum === 12) hourNum = 0; // Midnight case
    const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minutes}`;
    onTimeChange(formattedTime);
  }, [hours, minutes, period, onTimeChange]);

  return (
    <div className="flex items-center space-x-2">
      {/* Hour Input */}
      <Input
        type="text"
        maxLength={2}
        value={hours}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
          if (value && parseInt(value) <= 12) {
            setHours(value); // No padding here
          }
        }}
        placeholder="HH"
        className="w-16"
      />

      {/* Minute Input */}
      <Input
        type="text"
        maxLength={2}
        value={minutes}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
          if (value && parseInt(value) <= 59) {
            setMinutes(value); // No padding here
          }
        }}
        placeholder="MM"
        className="w-16"
      />

      {/* AM/PM Dropdown */}
      <Select
        onValueChange={(value) => setPeriod(value as "AM" | "PM")}
        value={period}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePicker;

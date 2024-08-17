import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartyPopperIcon } from "lucide-react";

dayjs.extend(customParseFormat);

interface IPeriod {
  subject: string;
  startTime: string;
  endTime: string;
}

interface ITimetable {
  day: string;
  periods: IPeriod[];
}

const formatTime = (time: string) => {
  return dayjs(time, "HH:mm").format("h:mm A");
};

const TimetableTabs: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [timetable, setTimetable] = useState<ITimetable[]>([]);
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axiosInstance.get(
          `${apiUrls.timetable.getTimetable}/${classId}`
        );
        setTimetable(response.data.timetable);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      }
    };

    fetchTimetable();
  }, [classId]);

  const renderPeriods = (day: string) => {
    const daySchedule = timetable.find((schedule) => schedule.day === day);

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <div className="text-primary flex items-center gap-x-2 justify-center mt-10">
          <span className="text-xl font-medium">No class on this day</span>
          <PartyPopperIcon />
        </div>
      );
    }

    return daySchedule.periods.map((period, index) => (
      <div key={index} className="p-2 border-[1px] border-primary rounded mb-2">
        <div className="font-medium">{period.subject}</div>
        <div className="text-sm">
          {formatTime(period.startTime)} - {formatTime(period.endTime)}
        </div>
      </div>
    ));
  };

  return (
    <Tabs defaultValue="Monday" className="w-full">
      <TabsList className="flex justify-around bg-primary">
        {daysOfWeek.map((day) => (
          <TabsTrigger key={day} value={day} className="text-white">
            {day}
          </TabsTrigger>
        ))}
      </TabsList>
      {daysOfWeek.map((day) => (
        <TabsContent key={day} value={day} className="">
          {renderPeriods(day)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TimetableTabs;

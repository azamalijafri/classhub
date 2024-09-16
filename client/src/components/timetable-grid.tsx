import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartyPopperIcon } from "lucide-react";
import { useLoading } from "@/stores/loader-store";

dayjs.extend(customParseFormat);

const formatTime = (time: string) => {
  return dayjs(time, "HH:mm").format("h:mm A");
};

const TimetableTabs: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { startLoading, stopLoading } = useLoading();

  const fetchDays = async () => {
    const response = await axiosInstance.get(
      `${apiUrls.classroom.getClassroomDays}/${classId}`
    );
    stopLoading();
    return response.data.days;
  };

  const fetchTimetable = async () => {
    const response = await axiosInstance.get(
      `${apiUrls.timetable.getTimetable}/${classId}`
    );
    return response.data.timetable;
  };

  const { data: availableDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ["classroomDays", classId],
    queryFn: fetchDays,
  });

  const { data: timetable, isLoading: isLoadingTimetable } = useQuery({
    queryKey: ["timetable", classId],
    queryFn: fetchTimetable,
  });

  useEffect(() => {
    startLoading();
  }, [startLoading]);

  const renderPeriods = (day: string) => {
    const daySchedule = timetable?.find(
      (schedule: ITimetable) => schedule.day === day
    );

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <div className="text-primary flex items-center gap-x-2 justify-center mt-10">
          <span className="text-xl font-medium">No class on this day</span>
          <PartyPopperIcon />
        </div>
      );
    }

    return daySchedule.periods.map((period: IPeriod, index: number) => (
      <div
        key={index}
        className="p-2 border-[1px] border-primary rounded mb-2 space-y-1"
      >
        <div className="">{period.subject.name}</div>
        <div className=" text-sm">Taking by {period.teacher.name}</div>
        <div className="text-xs ">
          {formatTime(period.startTime)} - {formatTime(period.endTime)}
        </div>
      </div>
    ));
  };

  if (isLoadingDays || isLoadingTimetable) return <div>Loading...</div>;

  if (!availableDays || availableDays.length === 0) return null;

  return (
    <Tabs defaultValue={availableDays[0]} className="w-full">
      <TabsList className="flex justify-around bg-primary">
        {availableDays.map((day: string) => (
          <TabsTrigger key={day} value={day} className="text-white">
            {day}
          </TabsTrigger>
        ))}
      </TabsList>
      {availableDays.map((day: string) => (
        <TabsContent key={day} value={day} className="">
          {renderPeriods(day)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TimetableTabs;

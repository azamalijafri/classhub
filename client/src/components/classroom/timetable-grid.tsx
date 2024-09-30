import React from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { apiUrls } from "@/constants/api-urls";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartyPopperIcon } from "lucide-react";
import { daysOfWeek } from "@/constants/variables";
import { useApi } from "@/hooks/useApiRequest";

dayjs.extend(customParseFormat);

const formatTime = (time: string) => {
  return dayjs(time, "HH:mm").format("h:mm A");
};

const TimetableTabs: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();

  const { data } = useApi({
    apiUrl: `${apiUrls.timetable.getTimetable}/${classroomId}`,
    queryKey: [`${classroomId}-timetable`],
  });

  const renderPeriods = (day: string) => {
    const daySchedule = data?.timetable?.find(
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
        className="p-2 border-[1px] border-primary rounded mb-2 space-y-1 overflow-hidden text-ellipsis w-full"
      >
        <div className="text-ellipsis overflow-hidden w-full whitespace-nowrap">
          {period.subject.name}
        </div>
        <div className=" text-sm text-ellipsis overflow-hidden whitespace-nowrap">
          Taking by {period.teacher.name}
        </div>
        <div className="text-xs ">
          {formatTime(period.startTime)} - {formatTime(period.endTime)}
        </div>
      </div>
    ));
  };

  return (
    <Tabs defaultValue={daysOfWeek[0]} className="w-full">
      <TabsList className="flex justify-around bg-primary">
        {daysOfWeek.map((day: string) => (
          <TabsTrigger key={day} value={day} className="text-white">
            {day}
          </TabsTrigger>
        ))}
      </TabsList>
      {daysOfWeek.map((day: string) => (
        <TabsContent key={day} value={day} className="">
          {renderPeriods(day)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TimetableTabs;

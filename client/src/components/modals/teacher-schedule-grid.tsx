import React from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartyPopperIcon } from "lucide-react";
import { useLoading } from "@/stores/loader-store";
import { Button } from "../ui/button";
import { useModal } from "@/stores/modal-store";

dayjs.extend(customParseFormat);

const formatTime = (time: string) => {
  return dayjs(time, "HH:mm").format("h:mm A");
};

const TeacherScheduleGrid: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { openModal } = useModal();

  const fetchTeacherSchedule = async () => {
    try {
      startLoading();
      const response = await axiosInstance.get(apiUrls.teacher.getMySchedule);
      return response.data;
    } finally {
      stopLoading();
    }
  };

  const { data: timetable, isLoading: isLoadingTimetable } = useQuery({
    queryKey: ["teacher-schedule"],
    queryFn: fetchTeacherSchedule,
  });

  const renderPeriods = (day: string) => {
    const daySchedule = timetable?.[day];

    if (!daySchedule || daySchedule.length === 0) {
      return (
        <div className="text-primary flex items-center gap-x-2 justify-center mt-10">
          <span className="text-xl font-medium">No class on this day</span>
          <PartyPopperIcon />
        </div>
      );
    }

    return daySchedule.map(
      (
        period: IPeriod & { classroom: IClassroom } & {
          attendanceTaken: boolean;
        },
        index: number
      ) => (
        <div
          key={index}
          className="p-2 border-[1px] border-zinc-500 rounded mb-2 flex justify-between items-center"
        >
          <div className="space-y-1 overflow-hidden text-ellipsis">
            <div className="overflow-hidden text-ellipsis">
              {period?.classroom?.name}
            </div>
            <div className="text-xs">
              {formatTime(period.startTime)} - {formatTime(period.endTime)}
            </div>
          </div>
          <div>
            {
              <Button
                disabled={period.attendanceTaken}
                onClick={() =>
                  openModal("attendance", {
                    classroom: period.classroom,
                    periodId: period._id,
                    teacherId: period.teacher?._id,
                    subjectId: period.subject?._id,
                  })
                }
              >
                {period.attendanceTaken
                  ? "Attendance Taken"
                  : "Take Attendance"}
              </Button>
            }
          </div>
        </div>
      )
    );
  };

  if (isLoadingTimetable) return null;

  const availableDays = Object.keys(timetable || {});

  if (availableDays.length === 0) return null;

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

export default TeacherScheduleGrid;

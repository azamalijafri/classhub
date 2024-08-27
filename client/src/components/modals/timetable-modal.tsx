import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalLayout } from "./modal-layout";
import {
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/stores/modal-store";
import { Label } from "../ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useShowToast } from "@/hooks/useShowToast";

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

const EditTimetableModal: React.FC = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal?.type === "edit-timetable");
  const classId = modal?.data?.classId;

  const [timetable, setTimetable] = useState<ITimetable[]>([]);
  const [activePeriod, setActivePeriod] = useState<IPeriod | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState<string>("");
  const [classroomDays, setClassroomDays] = useState<
    { day: string; startTime: string; endTime: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axiosInstance.get(
          `${apiUrls.timetable.getTimetable}/${classId}`
        );
        const fetchedTimetable = response.data.timetable;

        // Check if there are missing days in the fetched timetable
        classroomDays.forEach((day) => {
          if (
            !fetchedTimetable.some(
              (schedule: { day: string }) => schedule.day === day.day
            )
          ) {
            fetchedTimetable.push({ day, periods: [] });
          }
        });

        setTimetable(fetchedTimetable);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      }
    };

    const fetchDays = async () => {
      try {
        const response = await axiosInstance.get(
          `${apiUrls.classroom.getClassroomDetails}/${classId}`
        );
        const classroom = response.data.classroom;
        // const days = classroom?.days.map((day: { day: Day, startTime:string, endTime:string }) => day.day);
        setClassroomDays(classroom.days);
        setActiveDay(classroom.days[0].day || "");
      } catch (error) {
        console.error("Failed to fetch classroom details:", error);
      }
    };

    if (classroomDays.length > 0) {
      fetchTimetable();
    } else {
      fetchDays().then(fetchTimetable);
    }
  }, [classId, classroomDays]);

  const handleAddPeriod = (day: string) => {
    setActiveDay(day);
    setActivePeriod({ subject: "", startTime: "", endTime: "" });
    setEditingPeriod(null);
  };

  const handleEditPeriod = (day: string, index: number) => {
    setActiveDay(day);
    const daySchedule = timetable.find((schedule) => schedule.day === day);
    if (daySchedule) {
      setActivePeriod(daySchedule.periods[index]);
      setEditingPeriod(index);
    }
  };

  const handleSavePeriod = () => {
    if (!activePeriod) return;

    setTimetable((prevTimetable) =>
      prevTimetable.map((schedule) =>
        schedule.day === activeDay
          ? {
              ...schedule,
              periods:
                editingPeriod !== null
                  ? schedule.periods.map((period, idx) =>
                      idx === editingPeriod ? activePeriod : period
                    )
                  : [...schedule.periods, activePeriod],
            }
          : schedule
      )
    );
    setActivePeriod(null);
    setEditingPeriod(null);
  };

  const handleRemovePeriod = (day: string, index: number) => {
    setTimetable((prevTimetable) =>
      prevTimetable.map((schedule) =>
        schedule.day === day
          ? {
              ...schedule,
              periods: schedule.periods.filter((_, idx) => idx !== index),
            }
          : schedule
      )
    );
  };

  const { showToast } = useShowToast();

  const handleSaveTimetable = async () => {
    setIsLoading(true);
    const response = await axiosInstance.post(
      apiUrls.timetable.updateTimetable,
      { timetableData: timetable, classroomId: classId }
    );

    if (response) {
      queryClient.refetchQueries({
        queryKey: ["timetable", classId],
      });

      showToast({
        title: "Request Success",
        description: "Timetable has been updated successfully!",
      });
      closeModal();
    }
    setIsLoading(false);
  };

  const renderPeriods = (day: string) => {
    const daySchedule = timetable.find((schedule) => schedule.day === day);

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <div className="text-primary flex items-center gap-x-2 justify-center mt-10">
          <span className="text-xl font-medium">No class on this day</span>
        </div>
      );
    }

    return daySchedule.periods.map((period, index) => (
      <div
        key={index}
        className="p-2 border-[1px] border-primary rounded mb-2 flex justify-between items-center"
      >
        <div>
          <div className="font-medium">{period.subject}</div>
          <div className="text-sm">
            {formatTime(period.startTime)} - {formatTime(period.endTime)}
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPeriod(day, index)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemovePeriod(day, index)}
          >
            Remove
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <ModalLayout isOpen={true}>
      <DialogTitle className="text-lg font-medium text-primary mt-4">
        Edit Timetable
      </DialogTitle>
      <DialogDescription />
      {classroomDays.length > 0 ? (
        <Tabs
          defaultValue={classroomDays[0].day}
          className="w-full"
          onValueChange={setActiveDay}
        >
          <TabsList className="flex justify-around bg-primary">
            {classroomDays.map((day) => (
              <TabsTrigger key={day.day} value={day.day} className="text-white">
                {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
          {classroomDays.map((day) => (
            <TabsContent key={day.day} value={day.day} className="p-4">
              <div className="flex flex-col gap-y-4">
                <span className="mx-auto font-medium">
                  Day timing: {formatTime(day.startTime)}-
                  {formatTime(day.endTime)}
                </span>
                <div>{renderPeriods(day.day)}</div>
              </div>

              <div
                className={`grid grid-cols-5 gap-x-3 my-6 transition-all duration-500 ease-out ${
                  activePeriod && activeDay === day.day
                    ? "opacity-100 visible max-h-[200px]"
                    : "opacity-0 invisible max-h-0"
                }`}
              >
                <div className="flex flex-col gap-y-1 col-span-3">
                  <Label>Name</Label>
                  <Input
                    placeholder="Subject Name"
                    value={activePeriod?.subject || ""}
                    onChange={(e) =>
                      setActivePeriod({
                        ...activePeriod!,
                        subject: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                </div>
                <div className="flex flex-col gap-y-1 col-span-1">
                  <Label>Start</Label>
                  <Input
                    type="time"
                    value={activePeriod?.startTime || ""}
                    onChange={(e) =>
                      setActivePeriod({
                        ...activePeriod!,
                        startTime: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                </div>
                <div className="flex flex-col gap-y-1 col-span-1">
                  <Label>End</Label>{" "}
                  <Input
                    type="time"
                    value={activePeriod?.endTime || ""}
                    onChange={(e) =>
                      setActivePeriod({
                        ...activePeriod!,
                        endTime: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                </div>

                <div className="flex gap-x-4 col-span-5">
                  <Button onClick={handleSavePeriod}>Save Period</Button>
                  <Button
                    onClick={() => {
                      setActivePeriod(null);
                      setEditingPeriod(null);
                    }}
                    variant={"destructive"}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleAddPeriod(day.day)}
              >
                Add Period
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center text-primary mt-4">
          No active days available for this classroom.
        </div>
      )}
      <DialogFooter className="mx-auto flex gap-x-4 mt-4">
        <Button onClick={handleSaveTimetable} isLoading={isLoading}>
          Save Timetable
        </Button>
        <Button variant={"outline"} onClick={() => closeModal()}>
          Cancel
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default EditTimetableModal;

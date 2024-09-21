/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Loader2 } from "lucide-react";
import ComboBox from "../inputs/combo-box";
import qs from "query-string";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";

dayjs.extend(customParseFormat);

interface IPeriod {
  subject: string;
  startTime: string;
  endTime: string;
  teacher: string;
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

  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [timetable, setTimetable] = useState<ITimetable[]>([]);
  const [activePeriod, setActivePeriod] = useState<IPeriod | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState<string>("");
  const [classroomDays, setClassroomDays] = useState<
    { day: string; startTime: string; endTime: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; label: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const apiUrl = qs.stringifyUrl({
          url: apiUrls.teacher.getAllTeachers,
          query: { subject: activePeriod?.subject },
        });
        const response = await axiosInstance.get(apiUrl);
        const fetchedTeachers = response.data.teachers.map((teacher: any) => ({
          id: teacher._id,
          label: teacher.name,
        }));
        setTeachers(fetchedTeachers);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, [activePeriod?.subject]);

  useEffect(() => {
    // Fetch teachers data from backend

    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get(
          apiUrls.subject.getAllSubjects
        );
        const fetchedSubjects = response.data.subjects.map((subject: any) => ({
          id: subject._id,
          label: subject.name,
        }));
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const refetchQuery = useRefetchQuery();

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
            fetchedTimetable.push({ day: day.day, periods: [] });
          }
        });

        for (const schedule of fetchedTimetable) {
          for (const period of schedule.periods) {
            period.subject = period.subject._id;
            period.teacher = period.teacher._id;
          }
        }

        setTimetable(fetchedTimetable);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      } finally {
        setLoadingTimetable(false);
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
    setActivePeriod({ subject: "", startTime: "", endTime: "", teacher: "" });
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
    console.log(timetable);

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

  const handleSaveTimetable = async () => {
    try {
      setIsLoading(true);

      const timetableData = timetable.map((schedule: any) => {
        return { ...schedule, day: schedule.day };
      });

      const response = await axiosInstance.post(
        apiUrls.timetable.updateTimetable,
        { timetableData: timetableData, classroomId: classId }
      );

      if (response) {
        refetchQuery(["timetable", classId]);
        closeModal();
      }
    } finally {
      setIsLoading(false);
    }
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
        <div className="space-y-1">
          <div className="">
            {subjects.find((subject) => period.subject == subject.id)?.label}
          </div>
          <div className="text-sm ">
            {teachers.find((teacher) => period.teacher == teacher.id)?.label}
          </div>
          <div className="text-xs ">
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
    <ModalLayout isOpen={true} maxWidth={true}>
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
                {loadingTimetable ? (
                  <Loader2 className="animate-spin size-6 mx-auto mt-4" />
                ) : (
                  <div>{renderPeriods(day.day)}</div>
                )}
              </div>

              <div
                className={`w-full gap-x-3 my-6 transition-all duration-500 ease-out ${
                  activePeriod && activeDay === day.day
                    ? "opacity-100 visible max-h-[200px]"
                    : "opacity-0 invisible max-h-0"
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    {activePeriod && activeDay === day.day && (
                      <ComboBox
                        selectedValue={activePeriod.subject}
                        items={subjects}
                        placeholder="Select a subject"
                        label="Subject"
                        onSelect={(subject) =>
                          setActivePeriod((prev) =>
                            prev ? { ...prev, subject } : null
                          )
                        }
                      />
                    )}
                  </div>

                  <div>
                    {activePeriod && activeDay === day.day && (
                      <ComboBox
                        disabled={activePeriod.subject ? false : true}
                        selectedValue={activePeriod.teacher}
                        items={teachers}
                        placeholder="Select a teacher"
                        label="Teacher"
                        onSelect={(teacher) =>
                          setActivePeriod((prev) =>
                            prev ? { ...prev, teacher } : null
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
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
                    {/* <TimePicker date={date} setDate={setDate} /> */}
                  </div>

                  <div className="space-y-2">
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
                </div>

                <div className="flex gap-x-4 col-span-5 mt-4">
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
        <Button
          onClick={handleSaveTimetable}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
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

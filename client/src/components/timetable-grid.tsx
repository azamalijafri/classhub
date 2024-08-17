import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface IPeriod {
  subject: string;
  startTime: string;
  endTime: string;
}

interface ITimetable {
  day: string;
  periods: IPeriod[];
}

const TimetableGrid: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [timetable, setTimetable] = useState<ITimetable[]>([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axiosInstance.get(
          `${apiUrls.timetable.getTimetable}/${classId}`
        );
        console.log(response.data.timetable);

        setTimetable(response.data.timetable);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      }
    };

    fetchTimetable();
  }, [classId]);

  return (
    <div className="grid grid-cols-7 gap-4">
      {timetable?.map((daySchedule, index) => (
        <div key={index} className="flex flex-col">
          <div className="font-bold mb-2">{daySchedule.day}</div>
          {daySchedule.periods.map((period, idx) => (
            <div key={idx} className="border p-2 mb-2 rounded">
              <div className="text-sm font-medium">{period.subject}</div>
              <div className="text-xs">
                {period.startTime} - {period.endTime}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TimetableGrid;

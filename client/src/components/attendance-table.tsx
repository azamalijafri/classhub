import { useEffect, useState } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";

interface IAttendanceData {
  name: string;
  presentCount: number;
  percentage: string;
}

interface IProps {
  classId: string;
  teacherId: string;
}

const StudentsAttendanceTable = ({ classId }: IProps) => {
  const [attendanceData, setAttendanceData] = useState<IAttendanceData[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axiosInstance.post(
          apiUrls.attendance.getSubjectAttendance,
          {
            classId,
            teacherId,
          }
        );

        if (response?.data) {
          setAttendanceData(response.data.attendanceData);
          setTotalClasses(response.data.totalClasses);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch attendance data", error);
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [classId, teacherId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2Icon className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (!attendanceData.length) {
    return <p>No attendance data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
      <p className="mb-4">Total Classes: {totalClasses}</p>
      <Table>
        <Thead>
          <Tr>
            <Th>Student Name</Th>
            <Th>Classes Attended</Th>
            <Th>Attendance Percentage</Th>
          </Tr>
        </Thead>
        <Tbody>
          {attendanceData.map((student, index) => (
            <Tr key={index}>
              <Td>{student.name}</Td>
              <Td>{student.presentCount}</Td>
              <Td>{student.percentage}%</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default StudentsAttendanceTable;

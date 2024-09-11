import { useQuery } from "@tanstack/react-query";
import { useLoading } from "@/stores/loader-store";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

const ClassStudentsList = ({ queryKey }: { queryKey: string }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  //   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { classId } = useParams();

  const fetchStudents = async () => {
    startLoading();
    const response = await axiosInstance.get(
      `${apiUrls.student.getClassStudents}/${classId}`
    );
    stopLoading();
    return response.data.students;
  };

  const { data: students = [] } = useQuery({
    queryKey: [queryKey, "students"],
    queryFn: fetchStudents,
  });

  //   const toggleSelectStudent = (studentId: string) => {
  //     setSelectedStudents((prevSelected) =>
  //       prevSelected.includes(studentId)
  //         ? prevSelected.filter((id) => id !== studentId)
  //         : [...prevSelected, studentId]
  //     );
  //   };

  if (isLoading) return null;

  return (
    <div className="p-4 flex flex-col space-y-4">
      {students.length === 0 ? (
        <p className="mx-auto">No students found.</p>
      ) : (
        <Table className="border border-gray-300">
          <TableHeader>
            <TableRow className="bg-gray-100">
              {/* <TableHead className="py-2 px-4 border border-gray-300">
                Select
              </TableHead> */}
              <TableHead className="py-2 px-4 border border-gray-300">
                Name
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Email
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Roll No
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student: IStudent) => (
              <TableRow
                key={student._id}
                className="even:bg-gray-50 odd:bg-white"
              >
                {/* <TableCell className="py-2 px-4 border border-gray-300">
                  <Checkbox
                    checked={selectedStudents.includes(student._id)}
                    onClick={() => toggleSelectStudent(student._id)}
                  />
                </TableCell> */}
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.name}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.user.email}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.rollNo}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  <div className="flex space-x-2">
                    <Button variant={"destructive"}>Kick</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ClassStudentsList;

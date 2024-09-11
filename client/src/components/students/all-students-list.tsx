import { useState } from "react";
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
import { Checkbox } from "../ui/checkbox";
import { useModal } from "@/stores/modal-store";

const AllStudentsList = ({ queryKey }: { queryKey: string }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { openModal } = useModal();

  const fetchStudents = async () => {
    startLoading();
    const response = await axiosInstance.get(apiUrls.student.getAllStudents);
    stopLoading();
    return response.data.students;
  };

  const { data: students = [] } = useQuery({
    queryKey: [queryKey, "students"],
    queryFn: fetchStudents,
  });

  const handleEdit = (student: IStudent) => {
    console.log("Edit student", student);
  };

  const handleBlock = (student: IStudent) => {
    console.log("Block student", student);
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleAssign = () => {
    openModal("assign-students", { selectedStudents });
  };

  if (isLoading) return null;

  return (
    <div className="p-4 flex flex-col space-y-4">
      {/* Assign button */}
      <div className="flex justify-between items-center">
        {/* <h3 className="font-bold text-3xl">Students</h3> */}
        {/* {selectedStudents.length > 0 && ( */}
        <Button
          variant="default"
          onClick={handleAssign}
          className={`${
            selectedStudents.length > 0 ? "opacity-100" : "opacity-0"
          } transition`}
        >
          Assign Class
        </Button>
        {/* )} */}
      </div>

      {students.length === 0 ? (
        <p className="mx-auto">No students found.</p>
      ) : (
        <Table className="border border-gray-300">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="py-2 px-4 border border-gray-300">
                Select
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Name
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Email
              </TableHead>
              <TableHead className="py-2 px-4 border border-gray-300">
                Class
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
                <TableCell className="py-2 px-4 border border-gray-300">
                  {/* {!student.classroom && ( */}
                  <Checkbox
                    checked={selectedStudents.includes(student._id)}
                    onClick={() => toggleSelectStudent(student._id)}
                  />
                  {/* )} */}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.name}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.user.email}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.classroom?.name ?? `N/A`}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {student.rollNo}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleBlock(student)}
                    >
                      Block
                    </Button>
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

export default AllStudentsList;

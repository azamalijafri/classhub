/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

const columns = [
  { label: "Name", value: "name" },
  { label: "Roll No", value: "roll" },
  { label: "Present Count", value: "present" },
  { label: "Attendance Percentage", value: "percentage" },
];

interface StudentsAttendanceTableProps {
  data: any[];
  totalClasses: number;
  totalItems: number;
}

const StudentsAttendanceTable = ({
  data,
  totalClasses,
  totalItems,
}: StudentsAttendanceTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">Total Classes: {totalClasses}</p>
      <Table className="border border-gray-300">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {columns.map((item) => (
              <TableHead
                key={item.value}
                className="py-2 px-4 border border-gray-300 cursor-pointer hover:bg-zinc-200"
              >
                <div className="flex items-center gap-x-1">
                  <span>{item.label}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length > 0 ? (
            data?.map((item) => (
              <TableRow key={item._id} className="even:bg-gray-50 odd:bg-white">
                <TableCell className="py-2 px-4 border border-gray-300">
                  {item.name}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {item.roll}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {item.presentCount}
                </TableCell>
                <TableCell className="py-2 px-4 border border-gray-300">
                  {item.percentage}%
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between mt-4">
        <p className="text-sm font-medium">
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </p>
        <div className="space-x-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          >
            Previous
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsAttendanceTable;

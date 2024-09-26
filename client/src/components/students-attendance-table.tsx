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
  { label: "Name", value: "name", colspan: 4 },
  { label: "Roll No", value: "roll", colspan: 2 },
  { label: "Presents", value: "present", colspan: 2 },
  { label: "Percentage", value: "percentage", colspan: 2 },
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
      <Table className="border border-gray-300 border-l-0">
        <TableHeader>
          <TableHead className="bg-gray-100 p-0">
            <TableRow className="grid grid-cols-10 gap-2">
              {columns.map((col) => (
                <TableCell
                  key={col.value}
                  className={`font-medium col-span-${col.colspan} border-l-[1px]`}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </TableHeader>
        <TableBody>
          {data?.length > 0 ? (
            data?.map((item) => (
              <TableRow
                key={item._id}
                className="grid grid-cols-10 even:bg-gray-50 odd:bg-white gap-2"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.value}
                    className={`overflow-hidden text-ellipsis col-span-${col.colspan} border-l-[1px]`}
                  >
                    {(() => {
                      switch (col.value) {
                        case "name":
                          return item.name;
                        case "roll":
                          return item.roll;
                        case "present":
                          return item.presentCount;
                        case "percentage":
                          return `${item.percentage}%`;
                        default:
                          return null;
                      }
                    })()}
                  </TableCell>
                ))}
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

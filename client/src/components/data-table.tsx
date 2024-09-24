/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ComboBox from "@/components/inputs/combo-box";
import { useDebounce } from "@/hooks/useDebounce";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MoveDown, MoveUp, SearchIcon } from "lucide-react";

interface TableColumn {
  label: string;
  render: (item: any) => JSX.Element | string;
  value: string;
}

interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: (item: any) => JSX.Element;
  emptyMessage?: string;
  totalItems: number;
  classFilter?: boolean;
  subjectFilter?: boolean;
}

const DataTable = ({
  data,
  columns,
  actions,
  totalItems,
  classFilter,
  subjectFilter,
}: DataTableProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; label: string }[]>([]);

  const [params, setParams] = useState({
    search: queryParams.get("search") || "",
    class: queryParams.get("class") || "",
    subject: queryParams.get("subject") || "",
    page: Number(queryParams.get("page")) || 1,
    sortField: queryParams.get("sortField") || null,
    sortOrder: queryParams.get("sortOrder") || null,
  });

  const debouncedSearch = useDebounce(params.search, 500);

  const [itemsPerPage] = useState(10);

  const handleSortChange = (field: string) => {
    setParams((prevParams) => {
      const isSameField = prevParams.sortField === field;
      const newOrder =
        isSameField && prevParams.sortOrder === "asc" ? "desc" : "asc";
      return {
        ...prevParams,
        sortField: field,
        sortOrder: newOrder,
        page: 1,
      };
    });
  };

  const handleParamChange = (key: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      page: key != "page" ? 1 : (value as number),
    }));
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
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

    const fetchClasses = async () => {
      try {
        const response = await axiosInstance.get(
          apiUrls.classroom.getAllClassrooms
        );
        const fetchedClasses = response.data.classrooms.map(
          (classroom: any) => ({
            id: classroom._id,
            label: classroom.name,
          })
        );
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    if (classFilter) fetchClasses();
    if (subjectFilter) fetchSubjects();
  }, [classFilter, subjectFilter]);

  useEffect(() => {
    const paramsString = new URLSearchParams({
      page: params.page.toString(),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(params.class && { class: params.class }),
      ...(params.subject && { subject: params.subject }),
      ...(params.sortField && { sortField: params.sortField }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    }).toString();

    navigate({ search: paramsString });
  }, [
    debouncedSearch,
    params.class,
    params.subject,
    params.page,
    params.sortField,
    params.sortOrder,
    navigate,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-10 justify-between items-center mb-4 space-x-4 w-full">
        <div className="relative col-span-4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <Input
            type="text"
            value={params.search}
            onChange={(e) => handleParamChange("search", e.target.value)}
            placeholder="Search by name"
            className="pl-10"
          />
        </div>
        {classFilter && (
          <div className="col-span-3">
            <ComboBox
              items={classes}
              placeholder="Filter by class"
              onSelect={(id) => handleParamChange("class", id)}
              selectedValue={params.class}
            />
          </div>
        )}

        {subjectFilter && (
          <div className="col-span-3">
            <ComboBox
              items={subjects}
              placeholder="Filter by subject"
              onSelect={(id) => handleParamChange("subject", id)}
              selectedValue={params.subject}
            />
          </div>
        )}
      </div>

      {/* {data?.length === 0 ? (
        <div className="flex size-full items-center justify-center mt-10">
          <span className="text-xl font-medium">{emptyMessage}</span>
        </div>
      ) : ( */}
      <>
        <Table className="border border-gray-300">
          <TableHeader>
            <TableRow className="bg-gray-100">
              {columns.map((column) => (
                <TableHead
                  key={column.label}
                  className="py-2 px-4 border border-gray-300 cursor-pointer hover:bg-zinc-200"
                  onClick={() => handleSortChange(column.value)}
                >
                  <div className="flex items-center gap-x-1">
                    <span className="mb-0">{column.label}</span>

                    <div className="flex items-center">
                      <MoveUp
                        className={`size-3 ${
                          params.sortField == column.value &&
                          params.sortOrder == "asc" &&
                          "text-black"
                        }`}
                      />
                      <MoveDown
                        className={`size-3 ${
                          params.sortField == column.value &&
                          params.sortOrder == "desc" &&
                          "text-black"
                        }`}
                      />
                    </div>
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="py-2 px-4 border border-gray-300">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item) => (
              <TableRow key={item._id} className="even:bg-gray-50 odd:bg-white">
                {columns.map((column, index) => (
                  <TableCell
                    className="py-2 px-4 border border-gray-300"
                    key={index}
                  >
                    {column.render(item)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="py-2 px-4 border border-gray-300">
                    {actions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <p className="text-sm font-medium">
            Page {totalPages == 0 ? 0 : params.page} of {totalPages}
          </p>
          <div className="space-x-4">
            <Button
              disabled={params.page === 1}
              onClick={() =>
                handleParamChange("page", Math.max(params.page - 1, 1))
              }
            >
              Previous
            </Button>
            <Button
              disabled={params.page === totalPages}
              onClick={() =>
                handleParamChange("page", Math.min(params.page + 1, totalPages))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </>
      {/* )} */}
    </div>
  );
};

export default DataTable;

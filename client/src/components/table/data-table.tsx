/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ComboBox from "@/components/inputs/combo-box";
import { useDebounce } from "@/hooks/useDebounce";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { Input } from "../ui/input";
import { MoveDown, MoveUp, SearchIcon } from "lucide-react";
import Pagination from "./pagination";

interface TableColumn {
  label: string;
  render: (item: any) => JSX.Element | string;
  value: string;
  colspan?: number;
}

interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: (item: any) => JSX.Element;
  emptyMessage?: string;
  totalItems: number;
  classFilter?: boolean;
  subjectFilter?: boolean;
  gridValue: string;
}

const DataTable = ({
  data,
  columns,
  actions,
  totalItems,
  classFilter,
  subjectFilter,
  gridValue,
}: DataTableProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; label: string }[]>([]);

  const [search, setSearch] = useState(queryParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);

  const [params, setParams] = useState({
    class: queryParams.get("class") || "",
    subject: queryParams.get("subject") || "",
    page: Number(queryParams.get("page")) || 1,
    sf: queryParams.get("sf") || null,
    so: queryParams.get("so") || null,
  });

  const [itemsPerPage] = useState(10);

  const handleSortChange = (field: string) => {
    setParams((prevParams) => {
      const isSameField = prevParams.sf === field;
      const newOrder = isSameField && prevParams.so === "asc" ? "desc" : "asc";
      return {
        ...prevParams,
        sf: field,
        so: newOrder,
        page: 1,
      };
    });
  };

  const handleParamChange = (key: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : (value as number),
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
      ...(params.sf && { sf: params.sf }),
      ...(params.so && { so: params.so }),
    }).toString();

    navigate({ search: paramsString });
  }, [
    debouncedSearch,
    params.class,
    params.subject,
    params.page,
    params.sf,
    params.so,
    navigate,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`grid grid-cols-${gridValue} justify-between items-center mb-4 space-x-4 w-full`}
      >
        <div className="relative col-span-4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="pl-10"
          />
        </div>
        {classFilter && (
          <div className="col-span-3">
            <ComboBox
              isAbsolute={true}
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
              isAbsolute={true}
              items={subjects}
              placeholder="Filter by subject"
              onSelect={(id) => handleParamChange("subject", id)}
              selectedValue={params.subject}
            />
          </div>
        )}
      </div>

      <Table className="border border-gray-300 border-l-0">
        <TableHeader>
          <TableRow className={`grid grid-cols-${gridValue} bg-gray-100`}>
            {columns.map((col) => (
              <TableCell
                key={col.value}
                className={`font-medium cursor-pointer col-span-${
                  col.colspan || 1
                } border-l-[1px]`}
                onClick={() => handleSortChange(col.value)}
              >
                <div className="flex items-center gap-x-1">
                  <span>{col.label}</span>
                  <div className="flex items-center">
                    <MoveUp
                      className={`size-3 ${
                        params.sf == col.value && params.so == "asc"
                          ? "text-black"
                          : "text-zinc-400"
                      }`}
                    />
                    <MoveDown
                      className={`size-3 ${
                        params.sf == col.value && params.so == "desc"
                          ? "text-black"
                          : "text-zinc-400"
                      }`}
                    />
                  </div>
                </div>
              </TableCell>
            ))}
            {actions && (
              <TableCell className="font-medium border-l-[1px]">
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow
              key={item._id}
              className={`grid grid-cols-${gridValue} even:bg-gray-50 odd:bg-white`}
            >
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  className={`overflow-hidden text-ellipsis whitespace-nowrap h-full col-span-${
                    col.colspan || 1
                  } border-l-[1px]`}
                >
                  {col.render(item)}
                </TableCell>
              ))}
              {actions && (
                <TableCell className="py-2 border-l-[1px]">
                  {actions(item)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between mt-4 items-center">
        {totalPages != 0 && (
          <p className="text-sm font-medium">
            Page {params.page} of {totalPages || 0}
          </p>
        )}
        <Pagination
          currentPage={params.page}
          totalPages={totalPages}
          onPageChange={(page) => handleParamChange("page", page)}
        />
      </div>
    </div>
  );
};

export default DataTable;

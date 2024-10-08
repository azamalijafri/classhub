import { useEffect } from "react";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";
import { useParams, useLocation } from "react-router-dom";
import DataTable from "@/components/table/data-table";
import queryString from "query-string";
import { scrollToTop } from "@/lib/utils";

const TeacherAttendanceView = () => {
  const { classroomId } = useParams();

  const location = useLocation();
  const {
    search,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: `${apiUrls.teacher.getMySubjectAttendance}/${classroomId}`,
      query: {
        search,
        page,
        sf,
        so,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data: attendance, refetch } = useApi({
    apiUrl,
    queryKey: [classroomId, "attendance"],
  });

  useEffect(() => {
    refetch().then(() => scrollToTop());
  }, [search, page, sf, so, refetch]);

  return (
    <DataTable
      totalItems={attendance?.totalItems}
      gridValue="10"
      data={attendance?.attendanceData}
      columns={[
        {
          label: "Name",
          render: (student) => student.name,
          value: "name",
          colspan: 3,
        },
        {
          label: "Roll No",
          render: (student) => student.roll,
          value: "roll",
          colspan: 3,
        },
        {
          label: "Present Count",
          render: (student) =>
            `${student.presentCount} / ${attendance.totalClasses}`,
          value: "presentCount",
          colspan: 2,
        },
        {
          label: "Attendance %",
          render: (student) => student.percentage,
          value: "percentage",
          colspan: 2,
        },
      ]}
    />
  );
};

export default TeacherAttendanceView;

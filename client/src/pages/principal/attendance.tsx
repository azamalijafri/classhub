import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";
import { useParams, useLocation } from "react-router-dom";
import DataTable from "@/components/table/data-table";
import queryString from "query-string";
import { scrollToTop } from "@/lib/utils";

const PrincipalAttendanceView = () => {
  const { classroomId } = useParams();
  const [subjectId, setSubjectId] = useState<string | null>(null);

  const location = useLocation();
  const {
    search,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: `${apiUrls.classroom.getAttendance}/${classroomId}`,
      query: {
        subjectId,
        search,
        page,
        sf,
        so,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data: subjectsData } = useApi({
    apiUrl: `${apiUrls.classroom.getClassroomSubjects}/${classroomId}`,
    queryKey: ["classroom-subjects", classroomId],
  });

  const { data: attendance, refetch } = useApi({
    apiUrl,
    queryKey: [classroomId, subjectId, "attendance"],
    enabledFetch: !!subjectId,
  });

  useEffect(() => {
    if (subjectsData?.subjects && !subjectId) {
      setSubjectId(subjectsData.subjects[0]?._id);
    }
  }, [subjectsData, subjectId]);

  useEffect(() => {
    if (subjectId) {
      refetch().then(() => scrollToTop());
    }
  }, [subjectId, search, page, sf, so, refetch]);

  return (
    <Tabs
      value={subjectId || ""}
      onValueChange={(newSubjectId) => setSubjectId(newSubjectId)}
      className="w-full"
    >
      <TabsList className="flex justify-around bg-primary">
        {subjectsData?.subjects?.map((subject: ISubject) => (
          <TabsTrigger
            key={subject._id}
            value={subject._id}
            className="text-white"
          >
            {subject.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {subjectsData?.subjects?.map((subject: ISubject) => (
        <TabsContent key={subject._id} value={subject._id} className="">
          {/* {isLoadingAttendance ? (
            <div className="size-full flex items-center justify-center">
              <Loader2Icon className="animate-spin mt-32" />
            </div>
          ) : ( */}
          <div className="mt-5">
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
          </div>
          {/* )} */}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PrincipalAttendanceView;

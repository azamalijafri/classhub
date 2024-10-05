/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DataTable from "@/components/table/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/stores/modal-store";
import { useApi } from "@/hooks/useApiRequest";
import queryString from "query-string";
import { scrollToTop } from "@/lib/utils";
import axiosInstance from "@/lib/axios-instance";

const AllSubjects = () => {
  const location = useLocation();

  const {
    search,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: apiUrls.subject.getAllSubjectsWithClassCount,
      query: {
        search,
        page,
        sf,
        so,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { fetchedData: data, refetch } = useApi({
    apiUrl,
    queryKey: ["all-subjects"],
  });

  useEffect(() => {
    refetch().then(() => scrollToTop());
  }, [search, page, sf, so, apiUrl, refetch]);

  const { openModal } = useModal();

  const toggleSelectSubject = (subjectId: string) => {
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(subjectId)
        ? prevSelected.filter((id) => id !== subjectId)
        : [...prevSelected, subjectId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedSubjects.length === data?.subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(data?.subjects.map((subject: any) => subject._id));
    }
  };

  const columns = [
    {
      label: "Select",
      render: (subject: any) => (
        <Checkbox
          checked={selectedSubjects.includes(subject._id)}
          onClick={() => toggleSelectSubject(subject._id)}
        />
      ),
      value: "select",
      colspan: 0,
    },
    {
      label: "Name",
      render: (subject: any) => subject?.name,
      value: "name",
      colspan: 3,
    },
    {
      label: "Associated Classes",
      render: (subject: any) => {
        const count = subject?.classroomCount;
        return count > 0 ? `${count}` : "Not assigned to any class";
      },
      value: "classroomCount",
      colspan: 3,
    },
  ];

  const actions = (subject: ISubject) => (
    <div className="flex space-x-2">
      <Button
        variant="default"
        onClick={() => {
          openModal("upsert-subject", { subject });
        }}
      >
        Edit
      </Button>
      <Button
        variant={subject.status == 1 ? "destructive" : "default"}
        onClick={() => {
          openModal("confirm", {
            performingAction: async () => {
              const response = await axiosInstance.put(
                subject.status == 1
                  ? apiUrls.subject.disableSubject
                  : apiUrls.subject.enableSubject,
                { subjects: [subject._id] }
              );

              if (response) refetch();
            },
          });
        }}
      >
        {subject.status == 1 ? "Disable" : "Enable"}
      </Button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-xl underline underline-offset-4">
          All Subjects
        </h3>
        <div className="flex justify-between items-center mb-2 gap-x-3">
          <Button onClick={handleToggleSelectAll} variant={"outline"}>
            {selectedSubjects?.length === data?.subjects?.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              openModal("confirm", {
                performingAction: async () => {
                  const response = await axiosInstance.put(
                    apiUrls.subject.enableSubject,
                    { subjects: selectedSubjects }
                  );

                  if (response) refetch();
                },
              });
            }}
            disabled={selectedSubjects.length === 0}
          >
            Enable In Bulk
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              openModal("confirm", {
                performingAction: async () => {
                  const response = await axiosInstance.put(
                    apiUrls.subject.disableSubject,
                    { subjects: selectedSubjects }
                  );

                  if (response) refetch();
                },
              });
            }}
            disabled={selectedSubjects.length === 0}
          >
            Disable In Bulk
          </Button>
        </div>
      </div>

      <DataTable
        gridValue="10"
        data={data?.subjects}
        columns={columns}
        actions={actions}
        totalItems={data?.totalSubjects}
      />
    </div>
  );
};

export default AllSubjects;

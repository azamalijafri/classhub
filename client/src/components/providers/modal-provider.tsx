import { lazy, Suspense } from "react";
import { useModal } from "../../stores/modal-store";
import { Loader2Icon } from "lucide-react";

// Lazy load modal components
const CreateClassroomModal = lazy(
  () => import("../modals/upsert-classroom-modal")
);
const ConfirmModal = lazy(() => import("../modals/confirm-modal"));
const CreateTeacherModal = lazy(() => import("../modals/upsert-teacher-modal"));
const AssignTeacherModal = lazy(() => import("../modals/assign-teacher-modal"));
const TimetableModal = lazy(() => import("../modals/timetable-modal"));
const CreateStudentModal = lazy(() => import("../modals/upsert-student-modal"));
const AssignStudentModal = lazy(() => import("../modals/assign-student-modal"));
const UpsertSubjectsModal = lazy(
  () => import("../modals/upsert-subject-modal")
);
const AttendanceModal = lazy(() => import("../modals/attendance-modal"));

const modalComponents = {
  "upsert-classroom": CreateClassroomModal,
  "upsert-teacher": CreateTeacherModal,
  "upsert-student": CreateStudentModal,
  confirm: ConfirmModal,
  "assign-teacher": AssignTeacherModal,
  "edit-timetable": TimetableModal,
  "assign-students": AssignStudentModal,
  "upsert-subject": UpsertSubjectsModal,
  attendance: AttendanceModal,
};

const ModalProvider = () => {
  const { modals } = useModal();

  return (
    <>
      {modals.map((modal) => {
        const ModalComponent = modalComponents[modal.type!];
        return ModalComponent ? (
          <Suspense
            key={modal.type}
            fallback={
              <Loader2Icon className="animate-spin size-6 absolute inset-0" />
            }
          >
            <ModalComponent />
          </Suspense>
        ) : null;
      })}
    </>
  );
};

export default ModalProvider;

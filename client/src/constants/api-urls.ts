export const apiUrls = {
  noauth: {
    login: "/login",
  },
  school: {
    registerPrincipal: "/register",
  },
  classroom: {
    createClassroom: "/create/classroom",
    getAllClassrooms: "/get/all/classrooms",
    getClassroomDetails: "/get/classroom/details",
    getClassroomSubjects: "/get/classroom/subjects",
    assignTeacher: "/assign/teacher",
    getClassroomDays: "/get/classroom/days",
    assignStudents: "/assign/students",
    getClassStudents: "/get/students",
    removeClassroom: "/remove/classroom",
    updateClassroom: "/update/classroom",
  },
  user: {
    getMyProfile: "/get/my/profile",
  },
  teacher: {
    createTeacher: "/create/teacher",
    createBulkTeachers: "/create/bulk/teachers",
    getAllTeachers: "/get/all/teachers",
    updateTeacher: "/update/teacher",
    getMyClassroom: "/teacher/get/my/classroom",
    getMySchedule: "/get/my/schedule",
    removeTeacherFromSchool: "/remove/teacher",
    getMyAttendanceClasses: "/teacher/get/my/attendance/classes",
    getMySubjectAttendance: "/teacher/get/my/subject/attendance",
  },
  student: {
    createStudent: "/create/student",
    updateStudent: "/update/student",
    createBulkStudents: "/create/bulk/students",
    removeStudentFromSchool: "/remove/student",
    getAllStudents: "/get/all/students",
    kickStudentFromClass: "/kick/student",
  },
  timetable: {
    getTimetable: "/get/timetable",
    updateTimetable: "/update/timetable",
  },
  subject: {
    createSubjects: "/create/subjects",
    getAllSubjects: "/get/all/subjects",
  },
  attendance: {
    markAttendance: "/mark/attendance",
  },
};

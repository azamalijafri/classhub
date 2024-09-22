export const apiUrls = {
  noauth: {
    login: "/login",
  },
  school: {
    registerPrincipal: "/register",
    removeTeacherFromSchool: "/remove/teacher",
    removeClassroom: "/remove/classroom",
    updateClassroom: "/update/classroom",
    getAllStudents: "/get/all/students",
    removeStudentFromSchool: "/remove/student",
  },
  classroom: {
    createClassroom: "/create/classroom",
    getAllClassrooms: "/get/all/classrooms",
    getClassroomDetails: "/get/classroom/details",
    assignTeacher: "/assign/teacher",
    getClassroomDays: "/get/classroom/days",
    assignStudents: "/assign/students",
    getClassStudents: "/get/students",
    kickStudent: "/kick/student",
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
  },
  student: {
    createStudent: "/create/student",
    updateStudent: "/update/student",
    createBulkStudents: "/create/bulk/students",
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

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
    assignTeacher: "/assign/teacher",
    getClassroomDays: "/get/classroom/days",
    removeClassroom: "/remove/classroom",
    updateClassroom: "/update/classroom",
    assignStudents: "/assign/students",
  },
  user: {
    getMyProfile: "/get/my/profile",
  },
  teacher: {
    createTeacher: "/create/teacher",
    createBulkTeachers: "/create/bulk/teachers",
    getAllTeachers: "/get/all/teachers",
    removeTeacher: "/remove/teacher",
    updateTeacher: "/update/teacher",
  },
  student: {
    createStudent: "/create/student",
    getAllStudents: "/get/all/students",
    getClassStudents: "/get/students",
    kickStudent: "/kick/student",
    removeStudent: "/remove/student",
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
};

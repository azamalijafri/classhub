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
    kickStudent: "/kick/student",
  },
  user: {
    getMyProfile: "/get/my/profile",
  },
  teacher: {
    createTeacher: "/create/teacher",
    createBulkTeachers: "/create/bulk/teachers",
    getAllTeachers: "/get/all/teachers",
  },
  student: {
    createStudent: "/create/student",
    getAllStudents: "/get/all/students",
    getClassStudents: "/get/students",
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

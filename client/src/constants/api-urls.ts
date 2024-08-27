export const apiUrls = {
  noauth: {
    login: "/login",
  },
  classroom: {
    createClassroom: "/create/classroom",
    getAllClassrooms: "/get/all/classrooms",
    getClassroomDetails: "/get/classroom/details",
    assignTeacher: "/assign/teacher",
    getClassroomDays: "/get/classroom/days",
    removeClassroom: "/remove/classroom",
    updateClassroom: "/update/classroom",
  },
  user: {
    getMyProfile: "/get/my/profile",
  },
  teacher: {
    createTeacher: "/create/teacher",
    getAllTeachers: "/get/all/teachers",
  },
  student: {
    createStudent: "/create/student",
  },
  timetable: {
    getTimetable: "/get/timetable",
    updateTimetable: "/update/timetable",
  },
};

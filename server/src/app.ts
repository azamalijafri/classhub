import express from "express";
import connectDB from "./config/db";
import userRoutes from "./routes/auth-routes";
import roleRoutes from "./routes/profile-routes";
import classroomRoutes from "./routes/classroom-routes";
import timetableRoutes from "./routes/timetable-routes";
import teachersRoutes from "./routes/teacher-routes";
import schoolRoutes from "./routes/school-routes";
import studentsRoutes from "./routes/student-routes";
import subjectRoutes from "./routes/subject-routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// app.use((req, res, next) => {
//   console.log(`Received ${req.method} request for ${req.originalUrl}`);
//   next();
// });

connectDB();

app.use("/api", userRoutes);
app.use("/api", schoolRoutes);

app.use("/api", roleRoutes);
app.use("/api", classroomRoutes);
app.use("/api", timetableRoutes);
app.use("/api", teachersRoutes);
app.use("/api", studentsRoutes);
app.use("/api", subjectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

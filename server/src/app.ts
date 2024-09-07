import express from "express";
import connectDB from "./config/db";
import userRoutes from "./routes/auth-routes";
import roleRoutes from "./routes/profile-routes";
import classroomRoutes from "./routes/classroom-routes";
import timetableRoutes from "./routes/timetable-routes";
import teachersRoutes from "./routes/teacher-routes";
import schoolRoutes from "./routes/school-routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api", userRoutes);
app.use("/api", schoolRoutes);

app.use("/api", roleRoutes);
app.use("/api", classroomRoutes);
app.use("/api", timetableRoutes);
app.use("/api", teachersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

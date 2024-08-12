import express from "express";
import connectDB from "./config/db";
import userRoutes from "./routes/user-routes";
import roleRoutes from "./routes/role-routes";
import classroomRoutes from "./routes/classroom-routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.use("/api", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", classroomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

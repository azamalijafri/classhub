import { Routes, Route } from "react-router-dom";
import { PrincipalDashboard } from "../pages/principal/dashboard";
import ClassDetails from "../pages/common/class-details";

function PrincipalRoutes() {
  console.log("control reaching at principal");

  return (
    <Routes>
      <Route path="/" element={<PrincipalDashboard />} />
      <Route path="/class/:classId" element={<ClassDetails />} />
    </Routes>
  );
}

export default PrincipalRoutes;

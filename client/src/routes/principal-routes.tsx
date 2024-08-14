import { Routes, Route } from "react-router-dom";
import { PrincipalDashboard } from "../pages/principal/dashboard";

function PrincipalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrincipalDashboard />} />
    </Routes>
  );
}

export default PrincipalRoutes;

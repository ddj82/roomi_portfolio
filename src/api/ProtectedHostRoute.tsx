import { Navigate, Outlet } from "react-router-dom";

const ProtectedHostRoute = () => {
    const hostMode = localStorage.getItem("hostMode") === "true";
    return hostMode ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedHostRoute;

import { Navigate, Outlet } from "react-router-dom";

const ProtectedGuestRoute = () => {
    const hostMode = localStorage.getItem("hostMode") === "true";
    return hostMode ? <Navigate to="/host" replace /> : <Outlet />;
};

export default ProtectedGuestRoute;

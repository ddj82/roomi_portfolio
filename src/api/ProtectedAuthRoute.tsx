import { Navigate, Outlet } from "react-router-dom";

const ProtectedAuthRoute = () => {
    const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
    if (isAuthenticated) {
        return <Outlet />;
    } else {
        // alert('로그인 후 이용 가능합니다.');
        return <Navigate to="/" replace />;
    }
};

export default ProtectedAuthRoute;

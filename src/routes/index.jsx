import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../features/auth/components/Login";
import Register from "../features/auth/components/Register";
import MainChat from "../features/chat/components/MainChat";
import UnAuthorized from "../common/components/UnAuthorized";
import NotFoundPage from "../common/components/NotFoundPage";

const AppRoutes = () => {
    return (
      
            <Routes>
                <Route path="/login" element={
                    <ProtectedRoute publicOnly={true}>
                        <Login />
                    </ProtectedRoute>
                }
                />
            <Route path="/register" element={
                <ProtectedRoute publicOnly={true}>
                    <Register />
                </ProtectedRoute>
            }
            />

             <Route path="/" element={
                 <ProtectedRoute >
                    <MainChat />
                </ProtectedRoute>
            }
            />
            <Route path="/unauthorized" element={<UnAuthorized />} />
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
       
    )

}

export default AppRoutes
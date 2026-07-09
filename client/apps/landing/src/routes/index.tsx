import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import VerifyEmail from '../features/auth/pages/VerifyEmail';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>

        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
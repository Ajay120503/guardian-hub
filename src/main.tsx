import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./lib/auth";
import { Shell } from "./components/Shell";
const AuthPage = lazy(() =>
  import("./pages/Auth").then((module) => ({ default: module.AuthPage })),
);
const Overview = lazy(() =>
  import("./pages/Overview").then((module) => ({ default: module.Overview })),
);
const Devices = lazy(() =>
  import("./pages/Devices").then((module) => ({ default: module.Devices })),
);
const DeviceDetail = lazy(() =>
  import("./pages/DeviceDetail").then((module) => ({
    default: module.DeviceDetail,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/Settings").then((module) => ({
    default: module.SettingsPage,
  })),
);
const SafetyCenter = lazy(() =>
  import("./pages/SafetyCenter").then((module) => ({
    default: module.SafetyCenter,
  })),
);
function Protected() {
  const { token } = useAuth();
  return token ? <Shell /> : <Navigate to="/login" replace />;
}
function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<Protected />}>
          <Route index element={<Overview />} />
          <Route path="devices" element={<Devices />} />
          <Route path="devices/:deviceId" element={<DeviceDetail />} />
          <Route path="safety" element={<SafetyCenter />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

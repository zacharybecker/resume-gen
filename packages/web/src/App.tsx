import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import AuthGuard from "./components/layout/AuthGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateResume from "./pages/CreateResume";
import TuneResume from "./pages/TuneResume";
import Editor from "./pages/Editor";
import Pricing from "./pages/Pricing";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateResume />} />
            <Route path="/tune" element={<TuneResume />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route path="/editor/:id" element={<Editor />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

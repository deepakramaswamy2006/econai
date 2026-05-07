import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import CrisisPrediction from "./pages/CrisisPrediction";
import GDPForecast from "./pages/GDPForecast";
import InflationPrediction from "./pages/InflationPrediction";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import HistoricalTrends from "./pages/HistoricalTrends";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";

// Inner layout — Sidebar + main content, theme-aware
function AppLayout() {
  const { dark } = useTheme();

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: dark ? "#0b0f1a" : "#f8fafc",
      transition: "background 0.3s",
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: "auto",
        padding: "32px 40px",
        background: dark
          ? "linear-gradient(160deg, #0b0f1a 0%, #0f172a 60%, #1a1035 100%)"
          : "#f8fafc",
        transition: "background 0.3s",
      }}>
        <Routes>
          <Route path="/crisis"    element={<CrisisPrediction />} />
          <Route path="/gdp"       element={<GDPForecast />} />
          <Route path="/inflation" element={<InflationPrediction />} />
          <Route path="/scenario"  element={<ScenarioSimulator />} />
          <Route path="/trends"    element={<HistoricalTrends />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

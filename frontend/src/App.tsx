import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroPage } from "./pages/HeroPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoricalPage } from "./pages/HistoricalPage";
import { UploadPage } from "./pages/UploadPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/historical" element={<HistoricalPage />} />
        <Route path="/dashboard/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

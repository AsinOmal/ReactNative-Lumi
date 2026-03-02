import { Routes, Route } from "react-router";
import { HomeScreen } from "../screens/HomeScreen.tsx";
import { ScanScreen } from "../screens/ScanScreen.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/scan" element={<ScanScreen />} />
    </Routes>

  );
};

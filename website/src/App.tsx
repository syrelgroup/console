import { BrowserRouter, Route, Routes } from "react-router-dom";
import ILayout from "./components/layouts/ILayout";
import LoginPage from "./pages/LoginPage";
import SlikAnalyzePage from "./pages/SlikAnalyzePage";

type AppProps = {
  mode: "light" | "dark";
  setMode: React.Dispatch<React.SetStateAction<"light" | "dark">>;
};
export default function App({ mode, setMode }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<ILayout theme={mode} changetheme={setMode} />}
        >
          <Route index element={<SlikAnalyzePage />} />
          <Route path="/slik_analyze" element={<SlikAnalyzePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

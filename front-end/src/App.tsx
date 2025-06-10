// front-end/src/App.tsx
import { useEffect } from "react";
import axios from "axios";
import AppRoutes from "./AppRoutes";

export default function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  return <AppRoutes />;
}

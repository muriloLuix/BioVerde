import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex h-full w-full bg-brancoSal">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default Home;

import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="h-screen w-screen flex">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default Home;

import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Profile from "./pages/profile";

const Router = () => {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Chat */}
      <Route path="/home" element={<Home />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default Router;
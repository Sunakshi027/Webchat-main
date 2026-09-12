import React, { useState, useEffect } from "react";

import Sidebar from "../compoments/sidebar";
import Chat from "../compoments/chat";
import Rightsidebar from "../compoments/rightsidebar";

import { useNavigate } from "react-router-dom";

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("HOME TOKEN:", token);

    // Only redirect if token does not exist
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <div
        className="
          relative
          w-full
          h-screen
          bg-white
          overflow-hidden
          md:m-3
          md:h-[calc(100vh-24px)]
          md:rounded-2xl
          md:border
          md:border-gray-200
          md:shadow-lg
          xl:max-w-[1500px]
          grid
          grid-cols-1
          md:grid-cols-[300px_1fr]
        "
      >
        {/* LEFT SIDEBAR */}
        <div
          className={`
            bg-white
            border-r
            border-gray-200
            overflow-hidden
            min-w-0
            ${selectedUser ? "hidden md:block" : "block"}
          `}
        >
          <Sidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>

        {/* CHAT */}
        <div
          className={`
            bg-white
            overflow-hidden
            min-w-0
            h-full
            ${selectedUser ? "block" : "hidden md:block"}
          `}
        >
          <Chat
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setShowRightSidebar={setShowRightSidebar}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        {selectedUser && (
          <div
            className={`
              absolute
              top-0
              right-0
              h-full
              w-full
              sm:w-[380px]
              md:w-[400px]
              bg-white
              border-l
              border-gray-200
              shadow-2xl
              z-50
              transform
              transition-transform
              duration-300
              ease-out
              ${
                showRightSidebar
                  ? "translate-x-0"
                  : "translate-x-full"
              }
            `}
          >
            <Rightsidebar
              selectedUser={selectedUser}
              setShowRightSidebar={setShowRightSidebar}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
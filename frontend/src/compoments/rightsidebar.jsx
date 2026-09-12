import React from "react";

import dummy from "../assets/avrar.jpg";
import { imagesDummyData } from "../assests";
import { useNavigate } from "react-router-dom";

const Rightsidebar = ({
  selectedUser,
  setShowRightSidebar,
}) => {
  const navigate = useNavigate();

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* ================= HEADER ================= */}

      <div
        className="
          h-[72px]
          flex
          items-center
          gap-3
          px-4
          border-b
          border-gray-200
          shrink-0
        "
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={() => setShowRightSidebar(false)}
          className="
            w-9
            h-9
            flex
            items-center
            justify-center
            rounded-full
            hover:bg-gray-100
            active:scale-95
            transition
            cursor-pointer
            text-xl
          "
        >
          ←
        </button>

        <h2 className="text-lg font-semibold text-gray-800">
          Contact Info
        </h2>
      </div>

      {/* ================= PROFILE ================= */}

      <div
        className="
          flex
          flex-col
          items-center
          px-5
          pt-8
          pb-6
          border-b
          border-gray-200
        "
      >
        {/* PROFILE IMAGE */}

        <div className="relative group">
          <img
            src={selectedUser.profilePic || dummy}
            alt="profile"
            className="
              w-24
              h-24
              rounded-full
              object-cover
              border-4
              border-white
              shadow-md
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:shadow-lg
            "
          />

          {/* ONLINE STATUS */}

          <span
            className="
              absolute
              bottom-1
              right-1
              w-4
              h-4
              bg-green-500
              border-2
              border-white
              rounded-full
            "
          />
        </div>

        {/* NAME */}

        <h1
          className="
            mt-4
            text-xl
            font-semibold
            text-gray-800
          "
        >
          {selectedUser.fullName}
        </h1>

        {/* EMAIL */}

        <p
          className="
            mt-1
            text-sm
            font-medium
            text-gray-500
            break-all
            text-center
          "
        >
          {selectedUser.email}
        </p>

        {/* STATUS */}

        <p className="text-xs text-green-500 font-medium mt-1">
          Active now
        </p>

        {/* BIO */}

        <p
          className="
            text-sm
            text-gray-500
            text-center
            mt-3
            leading-relaxed
            max-w-[260px]
          "
        >
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      {/* ================= MEDIA ================= */}

      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Shared Media
          </h2>

          <span className="text-xs text-gray-400">
            {imagesDummyData.length} files
          </span>
        </div>

        {/* MEDIA GRID */}

        <div className="grid grid-cols-2 gap-2">
          {imagesDummyData.map((url, index) => (
            <div
              key={index}
              onClick={() =>
                window.open(url, "_blank")
              }
              className="
                aspect-square
                rounded-lg
                overflow-hidden
                bg-gray-100
                cursor-pointer
                border
                border-gray-200
                group
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <img
                src={url}
                alt="shared media"
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-110
                "
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= LOGOUT ================= */}

      <div
        className="
          p-5
          border-t
          border-gray-200
          shrink-0
        "
      >
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="
            w-full
            py-2.5
            rounded-lg
            border
            border-red-200
            text-red-500
            font-medium
            text-sm
            bg-white
            hover:bg-red-50
            hover:border-red-300
            hover:text-red-600
            active:scale-[0.98]
            transition-all
            duration-300
          "
        >
          Logout Yourself
        </button>
      </div>
    </div>
  );
};

export default Rightsidebar;
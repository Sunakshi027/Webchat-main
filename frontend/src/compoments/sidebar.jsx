<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Rightsidebar from './rightsidebar';
import logo from "../assets/image.png";
import menu from '../assets/menu.png';
=======
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import menu from "../assets/setting.jpg";
>>>>>>> 1f2d71e (Initial Webchat project)
import search from "../assets/searchbar11.webp";
import avtar from "../assets/avrar.jpg";

import {
  getUsers,
  searchUser,
  getCurrentUser,
} from "../api/userapi";

import {
  getMessages,
  getUnreadCount,
  getFavouriteMessages,
} from "../api/messageapi";

const Sidebar = ({
  selectedUser,
  setSelectedUser,
}) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [latestTimes, setLatestTimes] =
    useState({});

  const [unreadCounts, setUnreadCounts] =
    useState({});

  const [favouriteUserIds, setFavouriteUserIds] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showSettings, setShowSettings] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      const response = await getUsers();

      const userList =
        response?.users ||
        response?.data ||
        response ||
        [];

      setAllUsers(userList);

      return userList;
    } catch (error) {
      console.log(
        "Get users error:",
        error.response?.data ||
          error.message
      );

      return [];
    }
  };

  // =====================================================
  // GET LATEST MESSAGE TIME FOR EVERY USER
  // =====================================================

  const loadLatestMessageTimes = async (
    userList
  ) => {
    try {
      const times = {};

      await Promise.all(
        userList.map(async (user) => {
          try {
            const userId =
              user._id || user.id;

            const response =
              await getMessages(userId);

            const messages =
              response?.messages ||
              response?.data ||
              response ||
              [];

            if (
              !Array.isArray(messages) ||
              messages.length === 0
            ) {
              times[userId] = 0;
              return;
            }

            const validTimes =
              messages
                .map((message) => {
                  if (
                    !message.createdAt
                  ) {
                    return 0;
                  }

                  return new Date(
                    message.createdAt
                  ).getTime();
                })
                .filter(
                  (time) =>
                    !isNaN(time)
                );

            times[userId] =
              validTimes.length
                ? Math.max(
                    ...validTimes
                  )
                : 0;
          } catch (error) {
            times[
              user._id || user.id
            ] = 0;
          }
        })
      );

      setLatestTimes(times);

      return times;
    } catch (error) {
      console.log(
        "Latest message time error:",
        error
      );

      return {};
    }
  };

  // =====================================================
  // SORT USERS BY LATEST MESSAGE
  // =====================================================

  const sortUsersByLatestMessage = (
    userList,
    times
  ) => {
    const sorted = [...userList].sort(
      (a, b) => {

        const aId =
          a._id || a.id;

        const bId =
          b._id || b.id;

        const aTime =
          Number(times[aId]) || 0;

        const bTime =
          Number(times[bId]) || 0;

        return bTime - aTime;
      }
    );

    return sorted;
  };

  // =====================================================
  // LOAD UNREAD COUNTS
  // =====================================================

  const loadUnreadCounts = async (
    userList
  ) => {
    try {
      const counts = {};

      await Promise.all(
        userList.map(async (user) => {

          const userId =
            user._id || user.id;

          try {

            const response =
              await getUnreadCount(
                userId
              );

            const count =
              response?.unreadCount ??
              response?.count ??
              response?.data?.unreadCount ??
              response?.data?.count ??
              0;

            counts[userId] =
              Number(count) || 0;

          } catch (error) {

            counts[userId] = 0;

          }
        })
      );

      setUnreadCounts(counts);

      return counts;

    } catch (error) {

      console.log(
        "Unread error:",
        error
      );

      return {};
    }
  };

  // =====================================================
  // LOAD FAVOURITE USERS
  // =====================================================

  const loadFavouriteUsers =
    async () => {

      try {

        const response =
          await getFavouriteMessages();

        const messages =
          response?.messages ||
          response?.data?.messages ||
          response?.data ||
          response ||
          [];

        const currentResponse =
          await getCurrentUser();

        const currentUser =
          currentResponse?.user ||
          currentResponse;

        const currentUserId =
          currentUser?._id ||
          currentUser?.id;

        const ids = [];

        messages.forEach(
          (message) => {

            const senderId =
              message.senderId?._id ||
              message.senderId ||
              message.sender?._id ||
              message.sender ||
              "";

            const receiverId =
              message.receiverId?._id ||
              message.receiverId ||
              message.receiver?._id ||
              message.receiver ||
              "";

            let otherUserId = "";

            if (
              String(senderId) ===
              String(currentUserId)
            ) {

              otherUserId =
                receiverId;

            } else {

              otherUserId =
                senderId;

            }

            if (otherUserId) {

              ids.push(
                String(otherUserId)
              );

            }
          }
        );

        setFavouriteUserIds([
          ...new Set(ids),
        ]);

      } catch (error) {

        console.log(
          "Favourite error:",
          error.response?.data ||
            error.message
        );

      }
    };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadSidebarData =
    async () => {

      try {

        setLoading(true);

        const userList =
          await loadUsers();

        const times =
          await loadLatestMessageTimes(
            userList
          );

        await loadUnreadCounts(
          userList
        );

        await loadFavouriteUsers();

        const sortedUsers =
          sortUsersByLatestMessage(
            userList,
            times
          );

        setUsers(sortedUsers);

      } catch (error) {

        console.log(
          "Sidebar error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadSidebarData();

  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {

    const searchUsersData =
      async () => {

        try {

          if (!searchTerm.trim()) {

            const sorted =
              sortUsersByLatestMessage(
                allUsers,
                latestTimes
              );

            setUsers(sorted);

            return;
          }

          const response =
            await searchUser(
              searchTerm
            );

          const result =
            response?.users ||
            response?.data ||
            response ||
            [];

          const sorted =
            sortUsersByLatestMessage(
              result,
              latestTimes
            );

          setUsers(sorted);

        } catch (error) {

          console.log(
            "Search error:",
            error.response?.data ||
              error.message
          );

        }
      };

    searchUsersData();

  }, [
    searchTerm,
    allUsers,
    latestTimes,
  ]);

  // =====================================================
  // REFRESH ONE CHAT
  // =====================================================

  const refreshChatOrder = async (
    userId
  ) => {

    try {

      const response =
        await getMessages(userId);

      const messages =
        response?.messages ||
        response?.data ||
        response ||
        [];

      let latestTime = 0;

      if (
        Array.isArray(messages) &&
        messages.length
      ) {

        messages.forEach(
          (message) => {

            if (!message.createdAt) {
              return;
            }

            const time =
              new Date(
                message.createdAt
              ).getTime();

            if (
              !isNaN(time) &&
              time > latestTime
            ) {
              latestTime = time;
            }

          }
        );
      }

      setLatestTimes(
        (prev) => ({
          ...prev,
          [userId]:
            latestTime,
        })
      );

    } catch (error) {

      console.log(
        "Refresh chat order error:",
        error
      );

    }
  };

  // =====================================================
  // SELECT USER
  // =====================================================

  const handleSelectUser =
    async (user) => {

      setSelectedUser(user);

      const userId =
        user._id || user.id;

      await refreshChatOrder(
        userId
      );

      /*
        Reload users after updating
        latest message time.
      */

      const userList =
        allUsers.length
          ? allUsers
          : await loadUsers();

      const updatedTimes = {
        ...latestTimes,
      };

      /*
        Get messages again for selected
        user so the newest timestamp
        is available immediately.
      */

      try {

        const response =
          await getMessages(userId);

        const messages =
          response?.messages ||
          response?.data ||
          response ||
          [];

        let latest = 0;

        if (
          Array.isArray(messages)
        ) {

          messages.forEach(
            (message) => {

              if (
                message.createdAt
              ) {

                const time =
                  new Date(
                    message.createdAt
                  ).getTime();

                if (
                  !isNaN(time) &&
                  time > latest
                ) {
                  latest = time;
                }

              }

            }
          );
        }

        updatedTimes[userId] =
          latest;

        setLatestTimes(
          updatedTimes
        );

        const sorted =
          sortUsersByLatestMessage(
            userList,
            updatedTimes
          );

        setAllUsers(sorted);
        setUsers(sorted);

      } catch (error) {

        console.log(error);

      }
    };

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers =
    users.filter((user) => {

      const userId = String(
        user._id || user.id
      );

      const unread =
        Number(
          unreadCounts[userId] || 0
        );

      const favourite =
        favouriteUserIds.includes(
          userId
        );

      if (
        activeTab === "unread"
      ) {
        return unread > 0;
      }

      if (
        activeTab ===
        "favourites"
      ) {
        return favourite;
      }

      return true;
    });

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "unread",
      label: "Unread",
    },
    {
      id: "favourites",
      label: "Favourites",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
        h-full
        w-full
        bg-white
        flex
        flex-col
        overflow-hidden
      "
    >

<<<<<<< HEAD
        {/* Logo */}
       <div className=''>
         <img
          src={logo}
          alt="logo"
          className="
            w-23
            h-auto
            object-contain
            transition-transform duration-300
            hover:scale-105
=======
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          px-5
          pt-5
          pb-4
          border-b
          border-gray-100
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
>>>>>>> 1f2d71e (Initial Webchat project)
          "
        >

<<<<<<< HEAD
        <h4 className='text-[20px] font-bold text-center text-gray-600'>Chats</h4>
       </div>
         
        {/* Menu */}
        <div className="relative group">

          <button className="
            w-12 h-12
            rounded-full
            flex items-center justify-center
            bg-gray-100
            hover:bg-gray-200
            transition-all duration-300
            active:scale-90
          ">
            <img
              src={menu}
              alt="menu"
              className="w-8 h-8 object-contain"
            />
          </button>
=======
          <div>

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-gray-400
                font-semibold
              "
            >
              Messages
            </p>
>>>>>>> 1f2d71e (Initial Webchat project)

            <h2
              className="
                text-[24px]
                font-semibold
                text-gray-800
              "
            >
              Chats
            </h2>

          </div>

          {/* SETTINGS */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowSettings(
                  !showSettings
                )
              }
              className="
                w-10
                h-10
                rounded-full
                bg-gray-50
                border
                border-gray-100
                flex
                items-center
                justify-center
                hover:bg-gray-100
                transition
              "
            >

              <img
                src={menu}
                alt="settings"
                className="
                  w-6
                  h-6
                  object-contain
                  hover:rotate-45
                  transition
                "
              />

            </button>

            {showSettings && (

              <div
                className="
                  absolute
                  right-0
                  top-12
                  w-44
                  bg-white
                  border
                  border-gray-100
                  rounded-2xl
                  shadow-xl
                  p-2
                  z-50
                "
              >

                <button
                  type="button"
                  onClick={() => {

                    setShowSettings(
                      false
                    );

                    navigate(
                      "/profile"
                    );

                  }}
                  className="
                    w-full
                    text-left
                    px-3
                    py-2.5
                    text-sm
                    rounded-xl
                    hover:bg-gray-50
                  "
                >
                  Edit Profile
                </button>

                <div
                  className="
                    h-px
                    bg-gray-100
                    my-1
                  "
                />

                <button
                  type="button"
                  onClick={() => {

                    localStorage.removeItem(
                      "token"
                    );

                    navigate(
                      "/login"
                    );

                  }}
                  className="
                    w-full
                    text-left
                    px-3
                    py-2.5
                    text-sm
                    text-red-500
                    rounded-xl
                    hover:bg-red-50
                  "
                >
                  Log out
                </button>

              </div>

            )}

          </div>

        </div>

        {/* SEARCH */}

        <div className="mt-5">

          <div
            className="
              flex
              items-center
              gap-3
              px-4
              h-11
              bg-gray-50
              border
              border-gray-100
              rounded-xl
              focus-within:bg-white
              focus-within:border-gray-300
              transition
            "
          >

            <img
              src={search}
              alt="search"
              className="
                w-5
                h-5
                opacity-50
              "
            />

            <input
              type="text"
              placeholder="Search conversations"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="
                flex-1
                bg-transparent
                outline-none
                text-sm
              "
            />

            {searchTerm && (

              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="
                  text-xl
                  text-gray-400
                "
              >
                ×
              </button>

            )}

          </div>

        </div>

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div
        className="
          px-5
          py-4
          border-b
          border-gray-100
        "
      >

        <div
          className="
            flex
            gap-1
            p-1
            bg-gray-100
            rounded-xl
          "
        >

          {tabs.map((tab) => (

            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }
              className={`
                flex-1
                py-2
                rounded-lg
                text-xs
                font-semibold
                transition

                ${
                  activeTab ===
                  tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }
              `}
            >
              {tab.label}
            </button>

          ))}

        </div>

      </div>

      {/* =================================================
          USER LIST
      ================================================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          py-3
        "
      >

<<<<<<< HEAD
        <p className="
          px-2
          py-2
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-gray-400
        ">
          Users
        </p>
=======
        {loading ? (
>>>>>>> 1f2d71e (Initial Webchat project)

          <div
            className="
              flex
              justify-center
              pt-16
              text-sm
              text-gray-400
            "
          >
            Loading chats...
          </div>

        ) : filteredUsers.length ===
          0 ? (

<<<<<<< HEAD
            const isSelected = selectedUser?.id === user.id;
            const isOnline = index < 4;
=======
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              mt-20
            "
          >
>>>>>>> 1f2d71e (Initial Webchat project)

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-gray-50
                flex
                items-center
                justify-center
                text-xl
              "
            >
              {activeTab ===
              "favourites"
                ? "☆"
                : activeTab ===
                  "unread"
                ? "✓"
                : "⌕"}
            </div>

            <p
              className="
                mt-3
                text-sm
                text-gray-500
              "
            >
              No chats found
            </p>

          </div>

        ) : (

          <div
            className="
              flex
              flex-col
              gap-1
            "
          >

            {filteredUsers.map(
              (user, index) => {

                const userId =
                  user._id ||
                  user.id;

                const selectedId =
                  selectedUser?._id ||
                  selectedUser?.id;

                const isSelected =
                  String(
                    selectedId
                  ) ===
                  String(userId);

                const unread =
                  Number(
                    unreadCounts[
                      userId
                    ] || 0
                  );

                const isFavourite =
                  favouriteUserIds.includes(
                    String(userId)
                  );

                /*
                  Display latest message
                  time in sidebar.
                */

                const latestTime =
                  latestTimes[
                    userId
                  ];

                let displayTime = "";

                if (latestTime) {

                  const date =
                    new Date(
                      latestTime
                    );

                  const today =
                    new Date();

                  const sameDay =
                    date.toDateString() ===
                    today.toDateString();

                  displayTime =
                    sameDay
                      ? date.toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : date.toLocaleDateString(
                          [],
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        );
                }

                /*
                  Demo online status.
                */

                const isOnline =
                  index < 4;

                return (

                  <div
                    key={
                      userId ||
                      index
                    }
                    onClick={() =>
                      handleSelectUser(
                        user
                      )
                    }
                    className={`
<<<<<<< HEAD
                      w-14
                      h-14
                      rounded-full
                      object-cover
=======
                      relative
                      flex
                      items-center
                      gap-3
                      px-3
                      py-3
                      rounded-2xl
                      cursor-pointer
>>>>>>> 1f2d71e (Initial Webchat project)
                      transition-all

                      ${
                        isSelected
<<<<<<< HEAD
                          ? "ring-2 ring-blue-500 ring-offset-2"
                          : "group-hover:scale-105"
                      }
                    `}
                  />

                  {/* Online Dot */}
                  <span
                    className={`
                      absolute
                      bottom-0
                      right-0
                      w-3
                      h-3
                      rounded-full
                      border-2
                      border-white

                      ${
                        isOnline
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }
                    `}
                  ></span>

                </div>


                {/* User Info */}
                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-2">

                    <p
                      className={`
                        font-medium
                        text-sm
                        truncate
                        transition-colors
                        duration-300

                        ${
                          isSelected
                            ? "text-blue-700"
                            : "text-gray-800 group-hover:text-blue-600"
                        }
                      `}
                    >
                      {user.fullName}
                    </p>

                  <div className='flex flex-col'>
                        <span className="
                      text-[10px]
                      text-gray-400
                      flex-shrink-0
                    ">
                      10:30
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
  {user.unread}
</span>
                    </div>
                    

                  </div>


                  <p
                    className={`
                      text-xs
                      mt-1
                      transition-colors
                      duration-300

                      ${
                        isOnline
                          ? "text-green-500"
                          : "text-gray-400"
=======
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
>>>>>>> 1f2d71e (Initial Webchat project)
                      }
                    `}
                  >

                    {/* ACTIVE LINE */}

                    {isSelected && (

                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          -translate-y-1/2
                          w-[3px]
                          h-9
                          bg-blue-600
                          rounded-r-full
                        "
                      />

                    )}

                    {/* AVATAR */}

                    <div
                      className="
                        relative
                        flex-shrink-0
                      "
                    >

                      <img
                        src={
                          user.profilePic ||
                          avtar
                        }
                        alt=""
                        className="
                          w-12
                          h-12
                          rounded-full
                          object-cover
                        "
                      />

                      <span
                        className={`
                          absolute
                          bottom-0
                          right-0
                          w-3
                          h-3
                          rounded-full
                          border-2
                          border-white

                          ${
                            isOnline
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }
                        `}
                      />

                    </div>

                    {/* USER INFO */}

                    <div
                      className="
                        flex-1
                        min-w-0
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            min-w-0
                          "
                        >

                          <p
                            className={`
                              text-sm
                              truncate

                              ${
                                unread > 0
                                  ? "font-bold text-gray-900"
                                  : "font-medium text-gray-700"
                              }
                            `}
                          >
                            {user.fullName}
                          </p>

                          {isFavourite && (

                            <span
                              className="
                                text-yellow-500
                                text-xs
                              "
                            >
                              ★
                            </span>

                          )}

                        </div>

                        {/* TIME */}

                        {displayTime && (

                          <span
                            className={`
                              text-[10px]
                              flex-shrink-0

                              ${
                                unread > 0
                                  ? "text-blue-600 font-semibold"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {displayTime}
                          </span>

                        )}

                      </div>

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          mt-1
                        "
                      >

                        <p
                          className={`
                            text-xs

                            ${
                              unread > 0
                                ? "text-gray-600 font-medium"
                                : "text-gray-400"
                            }
                          `}
                        >
                          {isOnline
                            ? "Online"
                            : "Offline"}
                        </p>

                        {/* UNREAD */}

                        {unread > 0 && (

                          <span
                            className="
                              min-w-[20px]
                              h-5
                              px-1.5
                              rounded-full
                              bg-blue-600
                              text-white
                              text-[10px]
                              font-bold
                              flex
                              items-center
                              justify-center
                            "
                          >
                            {unread > 99
                              ? "99+"
                              : unread}
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default Sidebar;
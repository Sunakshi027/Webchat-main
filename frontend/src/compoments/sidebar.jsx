import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import menu from "../assets/setting.jpg";
import search from "../assets/search.png";
import avtar from "../assets/avrar.jpg";

import {
  getUsers,
  searchUser,
  getCurrentUser,
  addContact,
} from "../api/userapi";

import {
  getMessages,
  getUnreadCount,
  getFavouriteMessages,
} from "../api/messageapi";

import socket from "../api/socket";

const Sidebar = ({
  selectedUser,
  setSelectedUser,
}) => {
  const navigate = useNavigate();

  // =========================================================
  // USERS
  // =========================================================

  const [users, setUsers] = useState([]);

  const [allUsers, setAllUsers] = useState([]);

  // =========================================================
  // LATEST MESSAGE TIME
  // =========================================================

  const [latestTimes, setLatestTimes] = useState({});

  // =========================================================
  // UNREAD COUNTS
  // =========================================================

  const [unreadCounts, setUnreadCounts] = useState({});

  // =========================================================
  // FAVOURITE USERS
  // =========================================================

  const [favouriteUserIds, setFavouriteUserIds] = useState([]);

  // =========================================================
  // ACTIVE TAB
  // =========================================================

  const [activeTab, setActiveTab] = useState("all");

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // SETTINGS
  // =========================================================

  const [showSettings, setShowSettings] = useState(false);

  // =========================================================
  // LOADING
  // =========================================================

  const [loading, setLoading] = useState(true);

  // =========================================================
  // ONLINE USERS
  // =========================================================

  const [onlineUsers, setOnlineUsers] = useState([]);

  // =========================================================
  // ADD CONTACT MODAL
  // =========================================================

  const [showAddContact, setShowAddContact] = useState(false);

  const [contactEmail, setContactEmail] = useState("");

  const [addingContact, setAddingContact] = useState(false);

  const [contactError, setContactError] = useState("");

  const [contactSuccess, setContactSuccess] = useState("");

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      const response = await getUsers();

      console.log("Sidebar users response:", response);

      let userList = [];

      if (Array.isArray(response)) {
        userList = response;
      } else if (Array.isArray(response?.users)) {
        userList = response.users;
      } else if (Array.isArray(response?.data)) {
        userList = response.data;
      }

      setAllUsers(userList);

      return userList;
    } catch (error) {
      console.error("Load users error:", error);

      setAllUsers([]);

      return [];
    }
  };

  // =========================================================
  // LOAD LATEST MESSAGE TIMES
  // =========================================================

  const loadLatestMessageTimes = async (userList) => {
    try {
      const times = {};

      await Promise.all(
        userList.map(async (user) => {
          try {
            if (!user?._id) return;

            const response = await getMessages(user._id);

            const messages = Array.isArray(response)
              ? response
              : response?.messages || response?.data || [];

            if (!messages.length) {
              return;
            }

            const latestMessage = messages.reduce(
              (latest, message) => {
                if (!latest) return message;

                return new Date(message.createdAt) >
                  new Date(latest.createdAt)
                  ? message
                  : latest;
              },
              null
            );

            if (latestMessage?.createdAt) {
              times[user._id] = latestMessage.createdAt;
            }
          } catch (error) {
            console.error(
              `Latest message error for ${user._id}:`,
              error
            );
          }
        })
      );

      setLatestTimes(times);

      return times;
    } catch (error) {
      console.error("Load latest times error:", error);

      return {};
    }
  };

  // =========================================================
  // SORT USERS BY LATEST MESSAGE
  // =========================================================

  const sortUsersByLatestMessage = (
    userList,
    times = latestTimes
  ) => {
    return [...userList].sort((a, b) => {
      const timeA = times[a._id]
        ? new Date(times[a._id]).getTime()
        : 0;

      const timeB = times[b._id]
        ? new Date(times[b._id]).getTime()
        : 0;

      return timeB - timeA;
    });
  };

  // =========================================================
  // LOAD UNREAD COUNTS
  // =========================================================

  const loadUnreadCounts = async (userList) => {
    try {
      const counts = {};

      await Promise.all(
        userList.map(async (user) => {
          try {
            if (!user?._id) return;

            const response = await getUnreadCount(
              user._id
            );

            let count = 0;

            if (typeof response === "number") {
              count = response;
            } else if (
              typeof response?.count === "number"
            ) {
              count = response.count;
            } else if (
              typeof response?.unreadCount === "number"
            ) {
              count = response.unreadCount;
            }

            counts[user._id] = count;
          } catch (error) {
            console.error(
              `Unread count error for ${user._id}:`,
              error
            );

            counts[user._id] = 0;
          }
        })
      );

      setUnreadCounts(counts);

      return counts;
    } catch (error) {
      console.error("Load unread counts error:", error);

      return {};
    }
  };

  // =========================================================
  // LOAD FAVOURITE USERS
  // =========================================================

  const loadFavouriteUsers = async (userList) => {
    try {
      const favouriteResponse =
        await getFavouriteMessages();

      const favouriteMessages = Array.isArray(
        favouriteResponse
      )
        ? favouriteResponse
        : favouriteResponse?.messages ||
          favouriteResponse?.data ||
          [];

      const currentUser = await getCurrentUser();

      const currentUserId = String(
        currentUser?._id || ""
      );

      const favouriteIds = new Set();

      favouriteMessages.forEach((message) => {
        if (!message) return;

        const senderId =
          message.senderId?._id ||
          message.senderId;

        const receiverId =
          message.receiverId?._id ||
          message.receiverId;

        const sender = String(senderId || "");

        const receiver = String(receiverId || "");

        let otherUserId = "";

        if (sender === currentUserId) {
          otherUserId = receiver;
        } else {
          otherUserId = sender;
        }

        if (otherUserId) {
          favouriteIds.add(otherUserId);
        }
      });

      const validFavouriteIds = userList
        .filter((user) =>
          favouriteIds.has(String(user._id))
        )
        .map((user) => String(user._id));

      setFavouriteUserIds(validFavouriteIds);

      return validFavouriteIds;
    } catch (error) {
      console.error(
        "Load favourite users error:",
        error
      );

      setFavouriteUserIds([]);

      return [];
    }
  };

  // =========================================================
  // LOAD ALL SIDEBAR DATA
  // =========================================================

  const loadSidebarData = async () => {
    try {
      setLoading(true);

      const userList = await loadUsers();

      if (!userList.length) {
        setUsers([]);
        setLatestTimes({});
        setUnreadCounts({});
        setFavouriteUserIds([]);

        return;
      }

      const times =
        await loadLatestMessageTimes(userList);

      await loadUnreadCounts(userList);

      await loadFavouriteUsers(userList);

      const sortedUsers =
        sortUsersByLatestMessage(
          userList,
          times
        );

      setUsers(sortedUsers);
    } catch (error) {
      console.error(
        "Load sidebar data error:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadSidebarData();
  }, []);

  // =========================================================
  // REAL ONLINE USERS
  // =========================================================

  useEffect(() => {
    const handleOnlineUsers = (userIds) => {
      console.log(
        "Online users received:",
        userIds
      );

      if (!Array.isArray(userIds)) {
        setOnlineUsers([]);
        return;
      }

      setOnlineUsers(
        userIds.map((id) => String(id))
      );
    };

    socket.on(
      "online-users",
      handleOnlineUsers
    );

    return () => {
      socket.off(
        "online-users",
        handleOnlineUsers
      );
    };
  }, []);

  // =========================================================
  // SEARCH USER
  // =========================================================

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        const sortedUsers =
          sortUsersByLatestMessage(allUsers);

        setUsers(sortedUsers);

        return;
      }

      try {
        const response = await searchUser(
          searchTerm.trim()
        );

        let searchResults = [];

        if (Array.isArray(response)) {
          searchResults = response;
        } else if (Array.isArray(response?.users)) {
          searchResults = response.users;
        } else if (Array.isArray(response?.data)) {
          searchResults = response.data;
        }

        setUsers(searchResults);
      } catch (error) {
        console.error(
          "Search user error:",
          error
        );

        setUsers([]);
      }
    };

    const timer = setTimeout(
      searchUsers,
      300
    );

    return () => clearTimeout(timer);
  }, [searchTerm, allUsers]);

  // =========================================================
  // REFRESH CHAT ORDER
  // =========================================================

  const refreshChatOrder = async (userId) => {
    try {
      if (!userId) return;

      const response = await getMessages(
        userId
      );

      const messages = Array.isArray(response)
        ? response
        : response?.messages ||
          response?.data ||
          [];

      if (!messages.length) return;

      const latestMessage = messages.reduce(
        (latest, message) => {
          if (!latest) return message;

          return new Date(message.createdAt) >
            new Date(latest.createdAt)
            ? message
            : latest;
        },
        null
      );

      if (!latestMessage?.createdAt) {
        return;
      }

      const newTimes = {
        ...latestTimes,
        [userId]: latestMessage.createdAt,
      };

      setLatestTimes(newTimes);

      setUsers((prevUsers) =>
        sortUsersByLatestMessage(
          prevUsers,
          newTimes
        )
      );

      setAllUsers((prevUsers) =>
        sortUsersByLatestMessage(
          prevUsers,
          newTimes
        )
      );
    } catch (error) {
      console.error(
        "Refresh chat order error:",
        error
      );
    }
  };

  // =========================================================
  // SELECT USER
  // =========================================================

  const handleSelectUser = async (user) => {
    if (!user?._id) return;

    setSelectedUser(user);

    await refreshChatOrder(user._id);

    try {
      const response = await getMessages(
        user._id
      );

      console.log(
        "Selected user messages:",
        response
      );
    } catch (error) {
      console.error(
        "Load selected messages error:",
        error
      );
    }
  };

  // =========================================================
  // ADD CONTACT
  // =========================================================

  const handleAddContact = async () => {
    const email = contactEmail
      .trim()
      .toLowerCase();

    // Empty email
    if (!email) {
      setContactError(
        "Please enter an email address"
      );

      return;
    }

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setContactError(
        "Please enter a valid email address"
      );

      return;
    }

    try {
      setAddingContact(true);

      setContactError("");

      setContactSuccess("");

      // API call
      const response =
        await addContact(email);

      console.log(
        "Add contact response:",
        response
      );

      setContactSuccess(
        "User added successfully"
      );

      setContactEmail("");

      // Refresh complete sidebar
      await loadSidebarData();

      // Close modal after short delay
      setTimeout(() => {
        setShowAddContact(false);

        setContactSuccess("");

        setContactError("");
      }, 800);
    } catch (error) {
      console.error(
        "Add contact error:",
        error
      );

      setContactError(
        error?.response?.data?.message ||
          "Unable to add user"
      );
    } finally {
      setAddingContact(false);
    }
  };

  // =========================================================
  // CLOSE ADD USER MODAL
  // =========================================================

  const closeAddContactModal = () => {
    setShowAddContact(false);

    setContactEmail("");

    setContactError("");

    setContactSuccess("");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "";

    const messageDate =
      new Date(date);

    const today = new Date();

    const isToday =
      messageDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return messageDate.toLocaleDateString(
      [],
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = users.filter(
    (user) => {
      if (activeTab === "all") {
        return true;
      }

      if (activeTab === "unread") {
        return (
          Number(
            unreadCounts[user._id] || 0
          ) > 0
        );
      }

      if (activeTab === "favourites") {
        return favouriteUserIds.includes(
          String(user._id)
        );
      }

      return true;
    }
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="px-5 pt-5 pb-4 border-b border-gray-100">

        <div className="flex items-center justify-between">

          {/* TITLE */}

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Messages
            </h2>

            <p className="text-sm text-gray-500 mt-0.5">
              Chats
            </p>
          </div>


          {/* RIGHT BUTTONS */}

          <div className="flex items-center gap-2">

            {/* ADD USER BUTTON */}

            <button
              type="button"
              onClick={() => {
                setShowAddContact(true);

                setShowSettings(false);

                setContactError("");

                setContactSuccess("");
              }}
              title="Add User"
              className="
                w-9
                h-9
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                flex
                items-center
                justify-center
                text-xl
                font-light
                hover:bg-gray-50
                hover:border-gray-300
                transition-all
              "
            >
              +
            </button>


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
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-50
                  transition
                "
              >
                <img
                  src={menu}
                  alt="Settings"
                  className="w-5 h-5 object-contain"
                />
              </button>


              {/* SETTINGS DROPDOWN */}

              {showSettings && (
                <div
                  className="
                    absolute
                    right-0
                    top-11
                    w-44
                    bg-white
                    border
                    border-gray-100
                    rounded-xl
                    shadow-xl
                    z-50
                    overflow-hidden
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/profile")
                    }
                    className="
                      w-full
                      text-left
                      px-4
                      py-3
                      text-sm
                      text-gray-700
                      hover:bg-gray-50
                      transition
                    "
                  >
                    Edit Profile
                  </button>


                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      text-left
                      px-4
                      py-3
                      text-sm
                      text-red-500
                      hover:bg-red-50
                      transition
                    "
                  >
                    Log out
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          className="
            mt-4
            h-11
            flex
            items-center
            gap-3
            px-3.5
            rounded-xl
            bg-gray-50
            border
            border-gray-100
          "
        >

          <img
            src={search}
            alt="Search"
            className="w-4 h-4 opacity-60"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search users..."
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-gray-800
              placeholder:text-gray-400
            "
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="
                text-gray-400
                hover:text-gray-700
                text-sm
              "
            >
              ✕
            </button>
          )}

        </div>


        {/* ===================================================
            TABS
        =================================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            mt-4
          "
        >

          {/* ALL */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("all")
            }
            className={`
              px-4
              py-2
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            All
          </button>


          {/* UNREAD */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("unread")
            }
            className={`
              px-4
              py-2
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab === "unread"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Unread
          </button>


          {/* FAVOURITES */}

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "favourites"
              )
            }
            className={`
              px-4
              py-2
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab ===
                "favourites"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Favourites
          </button>

        </div>

      </div>


      {/* =====================================================
          USER LIST
      ===================================================== */}

      <div className="flex-1 overflow-y-auto">

        {/* LOADING */}

        {loading ? (
          <div className="px-5 py-10 text-center">

            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />

            <p className="text-sm text-gray-400 mt-3">
              Loading chats...
            </p>

          </div>
        ) : filteredUsers.length === 0 ? (

          /* EMPTY */

          <div className="px-5 py-14 text-center">

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-gray-50
                border
                border-gray-100
                flex
                items-center
                justify-center
                mx-auto
                text-2xl
              "
            >
              +
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-800">
              No users yet
            </h3>

            <p className="mt-1 text-xs text-gray-400 leading-5">
              Add someone using their
              registered email address
            </p>

            <button
              type="button"
              onClick={() => {
                setShowAddContact(true);

                setContactError("");

                setContactSuccess("");
              }}
              className="
                mt-4
                px-4
                py-2
                rounded-xl
                bg-black
                text-white
                text-xs
                font-medium
                hover:bg-gray-800
                transition
              "
            >
              Add User
            </button>

          </div>
        ) : (

          /* USER LIST */

          <div className="py-2">

            {filteredUsers.map(
              (user) => {

                const isSelected =
                  String(
                    selectedUser?._id
                  ) ===
                  String(user._id);


                // ==========================================
                // REAL ONLINE STATUS
                // ==========================================

                const isOnline =
                  onlineUsers.includes(
                    String(user._id)
                  );


                // ==========================================
                // UNREAD
                // ==========================================

                const unreadCount =
                  Number(
                    unreadCounts[
                      user._id
                    ] || 0
                  );


                // ==========================================
                // FAVOURITE
                // ==========================================

                const isFavourite =
                  favouriteUserIds.includes(
                    String(user._id)
                  );


                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() =>
                      handleSelectUser(
                        user
                      )
                    }
                    className={`
                      w-full
                      px-4
                      py-3
                      flex
                      items-center
                      gap-3
                      text-left
                      transition
                      ${
                        isSelected
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >

                    {/* ====================================
                        AVATAR
                    ==================================== */}

                    <div className="relative shrink-0">

                      <img
                        src={
                          user.profilePic ||
                          avtar
                        }
                        alt={
                          user.fullName ||
                          "User"
                        }
                        className="
                          w-11
                          h-11
                          rounded-full
                          object-cover
                          border
                          border-gray-100
                        "
                      />


                      {/* ONLINE DOT */}

                      <span
                        className={`
                          absolute
                          right-0
                          bottom-0
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


                    {/* ====================================
                        USER DETAILS
                    ==================================== */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-2">

                        <h3
                          className="
                            text-sm
                            font-semibold
                            text-gray-800
                            truncate
                          "
                        >
                          {user.fullName ||
                            "Unknown User"}
                        </h3>


                        {/* TIME */}

                        {latestTimes[
                          user._id
                        ] && (
                          <span
                            className="
                              text-[10px]
                              text-gray-400
                              shrink-0
                            "
                          >
                            {formatTime(
                              latestTimes[
                                user._id
                              ]
                            )}
                          </span>
                        )}

                      </div>


                      {/* EMAIL / ONLINE */}

                      <div className="flex items-center justify-between gap-2 mt-1">

                        <p
                          className="
                            text-xs
                            text-gray-400
                            truncate
                          "
                        >
                          {isOnline
                            ? "Online"
                            : user.email ||
                              "Offline"}
                        </p>


                        {/* RIGHT SIDE */}

                        <div className="flex items-center gap-2 shrink-0">

                          {/* FAVOURITE */}

                          {isFavourite && (
                            <span
                              className="
                                text-yellow-500
                                text-sm
                              "
                            >
                              ★
                            </span>
                          )}


                          {/* UNREAD */}

                          {unreadCount > 0 && (
                            <span
                              className="
                                min-w-5
                                h-5
                                px-1.5
                                rounded-full
                                bg-black
                                text-white
                                text-[10px]
                                font-medium
                                flex
                                items-center
                                justify-center
                              "
                            >
                              {unreadCount >
                              99
                                ? "99+"
                                : unreadCount}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>


      {/* =====================================================
          ADD USER MODAL
      ===================================================== */}

      {showAddContact && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/20
            backdrop-blur-[2px]
            flex
            items-center
            justify-center
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-sm
              bg-white
              rounded-2xl
              border
              border-gray-100
              shadow-2xl
              p-6
            "
          >

            {/* ============================================
                MODAL HEADER
            ============================================ */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="text-lg font-semibold text-gray-900">
                  Add User
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add a registered user using
                  their email
                </p>

              </div>


              {/* CLOSE */}

              <button
                type="button"
                onClick={
                  closeAddContactModal
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                  transition
                "
              >
                ✕
              </button>

            </div>


            {/* ============================================
                EMAIL INPUT
            ============================================ */}

            <div className="mt-6">

              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                "
              >
                Gmail / Email
              </label>

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(
                    e.target.value
                  );

                  setContactError("");

                  setContactSuccess("");
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    handleAddContact();
                  }
                }}
                placeholder="example@gmail.com"
                autoFocus
                className="
                  w-full
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-gray-200
                  outline-none
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                  focus:border-gray-400
                  focus:ring-2
                  focus:ring-gray-100
                  transition
                "
              />

            </div>


            {/* ============================================
                ERROR
            ============================================ */}

            {contactError && (
              <div
                className="
                  mt-3
                  px-3
                  py-2.5
                  rounded-xl
                  bg-red-50
                  border
                  border-red-100
                "
              >
                <p className="text-xs text-red-600">
                  {contactError}
                </p>
              </div>
            )}


            {/* ============================================
                SUCCESS
            ============================================ */}

            {contactSuccess && (
              <div
                className="
                  mt-3
                  px-3
                  py-2.5
                  rounded-xl
                  bg-green-50
                  border
                  border-green-100
                "
              >
                <p className="text-xs text-green-600">
                  {contactSuccess}
                </p>
              </div>
            )}


            {/* ============================================
                BUTTONS
            ============================================ */}

            <div className="flex gap-3 mt-6">

              {/* CANCEL */}

              <button
                type="button"
                onClick={
                  closeAddContactModal
                }
                disabled={addingContact}
                className="
                  flex-1
                  h-11
                  rounded-xl
                  border
                  border-gray-200
                  text-gray-700
                  text-sm
                  font-medium
                  hover:bg-gray-50
                  disabled:opacity-50
                  transition
                "
              >
                Cancel
              </button>


              {/* ADD */}

              <button
                type="button"
                onClick={
                  handleAddContact
                }
                disabled={
                  addingContact
                }
                className="
                  flex-1
                  h-11
                  rounded-xl
                  bg-black
                  text-white
                  text-sm
                  font-medium
                  hover:bg-gray-800
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition
                "
              >
                {addingContact
                  ? "Adding..."
                  : "Add User"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Sidebar;
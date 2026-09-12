import React, { useEffect, useState } from "react";

import avtar from "../assets/avrar.jpg";

import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiPlus,
  FiSettings,
  FiLogOut,
  FiX,
  FiUserPlus,
} from "react-icons/fi";

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

import socket from "../socket";

const Sidebar = ({
  selectedUser,
  setSelectedUser,
}) => {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const [loading, setLoading] = useState(true);

  const [latestTimes, setLatestTimes] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [favouriteUserIds, setFavouriteUserIds] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [showSettings, setShowSettings] = useState(false);

  // Add user modal
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactEmail, setContactEmail] = useState("");

  const [addingContact, setAddingContact] = useState(false);

  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  // =====================================================
  // LOAD CONTACTS
  // =====================================================

  const loadUsers = async () => {
    try {
      const data = await getUsers();

      const contactList = Array.isArray(data)
        ? data
        : [];

      setUsers(contactList);
      setAllUsers(contactList);
    } catch (error) {
      console.error(
        "Load users error:",
        error
      );

      setUsers([]);
      setAllUsers([]);
    }
  };

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  const loadCurrentUser = async () => {
    try {
      const data = await getCurrentUser();

      setCurrentUser(data);
    } catch (error) {
      console.error(
        "Load current user error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD LATEST MESSAGE TIME
  // =====================================================

  const loadLatestMessageTimes = async (
    userList
  ) => {
    try {
      const times = {};

      await Promise.all(
        userList.map(async (user) => {
          try {
            const messages = await getMessages(
              user._id
            );

            if (
              Array.isArray(messages) &&
              messages.length > 0
            ) {
              const lastMessage =
                messages[messages.length - 1];

              times[user._id] =
                new Date(
                  lastMessage.createdAt
                ).getTime();
            }
          } catch (error) {
            console.error(
              `Message error for ${user._id}:`,
              error
            );
          }
        })
      );

      setLatestTimes(times);
    } catch (error) {
      console.error(
        "Latest message error:",
        error
      );
    }
  };

  // =====================================================
  // SORT USERS BY LATEST MESSAGE
  // =====================================================

  const sortUsersByLatestMessage = (
    userList,
    times = latestTimes
  ) => {
    return [...userList].sort((a, b) => {
      const timeA = times[a._id] || 0;
      const timeB = times[b._id] || 0;

      return timeB - timeA;
    });
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
          try {
            const result =
              await getUnreadCount(user._id);

            counts[user._id] =
              result?.count || 0;
          } catch (error) {
            counts[user._id] = 0;
          }
        })
      );

      setUnreadCounts(counts);
    } catch (error) {
      console.error(
        "Unread count error:",
        error
      );
    }
  };

  // =====================================================
  // LOAD FAVOURITE USERS
  // =====================================================

  const loadFavouriteUsers = async () => {
    try {
      const favouriteMessages =
        await getFavouriteMessages();

      if (
        !Array.isArray(favouriteMessages)
      ) {
        setFavouriteUserIds([]);
        return;
      }

      const ids = [
        ...new Set(
          favouriteMessages
            .map((message) => {
              const sender =
                message.senderId?._id ||
                message.senderId;

              const receiver =
                message.receiverId?._id ||
                message.receiverId;

              const currentId =
                currentUser?._id;

              if (
                String(sender) ===
                String(currentId)
              ) {
                return String(receiver);
              }

              return String(sender);
            })
            .filter(Boolean)
        ),
      ];

      setFavouriteUserIds(ids);
    } catch (error) {
      console.error(
        "Favourite users error:",
        error
      );

      setFavouriteUserIds([]);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadSidebarData = async () => {
    try {
      setLoading(true);

      await loadCurrentUser();
      await loadUsers();
    } catch (error) {
      console.error(
        "Sidebar loading error:",
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
  // LOAD MESSAGE DATA WHEN USERS CHANGE
  // =====================================================

  useEffect(() => {
    if (!users.length) {
      setLatestTimes({});
      setUnreadCounts({});
      return;
    }

    loadLatestMessageTimes(users);
    loadUnreadCounts(users);
  }, [users]);

  // =====================================================
  // LOAD FAVOURITES
  // =====================================================

  useEffect(() => {
    if (currentUser?._id) {
      loadFavouriteUsers();
    }
  }, [currentUser?._id]);

  // =====================================================
  // ONLINE USERS
  // =====================================================

  useEffect(() => {
    const handleOnlineUsers = (
      userIds
    ) => {
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

  // =====================================================
  // REALTIME CONTACT ADDED
  // =====================================================

  useEffect(() => {
    const handleContactAdded = (data) => {
      if (!data?.user?._id) {
        return;
      }

      const newUser = data.user;

      console.log(
        "👤 New contact received:",
        newUser
      );

      // -----------------------------------------------
      // ADD TO ALL USERS
      // -----------------------------------------------

      setAllUsers((prev) => {
        const exists = prev.some(
          (user) =>
            String(user._id) ===
            String(newUser._id)
        );

        if (exists) {
          return prev;
        }

        return [
          newUser,
          ...prev,
        ];
      });

      // -----------------------------------------------
      // ADD TO VISIBLE USERS
      // -----------------------------------------------

      setUsers((prev) => {
        const exists = prev.some(
          (user) =>
            String(user._id) ===
            String(newUser._id)
        );

        if (exists) {
          return prev;
        }

        return [
          newUser,
          ...prev,
        ];
      });
    };

    socket.on(
      "contact-added",
      handleContactAdded
    );

    return () => {
      socket.off(
        "contact-added",
        handleContactAdded
      );
    };
  }, []);

  // =====================================================
  // SEARCH CONTACTS
  // =====================================================

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setUsers(allUsers);
        return;
      }

      try {
        const data = await searchUser(
          searchTerm.trim()
        );

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Search error:",
          error
        );

        setUsers([]);
      }
    }, 300);

    return () =>
      clearTimeout(delay);
  }, [
    searchTerm,
    allUsers,
  ]);

  // =====================================================
  // FILTER USERS
  // =====================================================

  const getFilteredUsers = () => {
    if (activeTab === "unread") {
      return users.filter(
        (user) =>
          (unreadCounts[user._id] || 0) >
          0
      );
    }

    if (activeTab === "favourites") {
      return users.filter((user) =>
        favouriteUserIds.includes(
          String(user._id)
        )
      );
    }

    return users;
  };

  const filteredUsers =
    getFilteredUsers();

  // =====================================================
  // SELECT USER
  // =====================================================

  const handleSelectUser = async (
    user
  ) => {
    setSelectedUser(user);

    setUnreadCounts((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  // =====================================================
  // REFRESH CHAT ORDER
  // =====================================================

  const refreshChatOrder = async () => {
    try {
      const data = await getUsers();

      const contactList =
        Array.isArray(data)
          ? data
          : [];

      setAllUsers(contactList);
      setUsers(contactList);

      await loadLatestMessageTimes(
        contactList
      );

      await loadUnreadCounts(
        contactList
      );

      await loadFavouriteUsers();
    } catch (error) {
      console.error(
        "Refresh sidebar error:",
        error
      );
    }
  };

  // =====================================================
  // ADD CONTACT
  // =====================================================

  const handleAddContact = async (e) => {
    e.preventDefault();

    setContactError("");
    setContactSuccess("");

    if (!contactEmail.trim()) {
      setContactError(
        "Please enter Gmail"
      );
      return;
    }

    try {
      setAddingContact(true);

      const response =
        await addContact(
          contactEmail.trim()
        );

      setContactSuccess(
        response?.message ||
          "Contact added successfully"
      );

      setContactEmail("");

      await refreshChatOrder();

      setTimeout(() => {
        setShowAddContact(false);
        setContactSuccess("");
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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    socket.disconnect();

    navigate("/");
  };

  // =====================================================
  // USER TIME
  // =====================================================

  const formatTime = (userId) => {
    const time =
      latestTimes[userId];

    if (!time) return "";

    const date = new Date(time);

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full h-full bg-white flex flex-col relative">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="px-4 py-4 border-b border-gray-100">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Chats
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {currentUser?.fullName ||
                "WebChat"}
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* ADD USER */}

            <button
              type="button"
              onClick={() => {
                setShowAddContact(true);
                setContactError("");
                setContactSuccess("");
              }}
              className="
                w-9 h-9
                rounded-full
                bg-gray-100
                hover:bg-gray-200
                flex items-center justify-center
                text-gray-600
                transition
              "
              title="Add User"
            >
              <FiPlus className="text-lg" />
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
                  w-9 h-9
                  rounded-full
                  bg-gray-100
                  hover:bg-gray-200
                  flex items-center justify-center
                  text-gray-600
                  transition
                "
                title="Settings"
              >
                <FiSettings className="text-lg" />
              </button>

              {showSettings && (
                <div
                  className="
                    absolute
                    right-0
                    top-11
                    w-44
                    bg-white
                    border
                    border-gray-200
                    rounded-xl
                    shadow-xl
                    z-40
                    overflow-hidden
                  "
                >

                  {/* PROFILE */}

                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      navigate("/profile");
                    }}
                    className="
                      w-full
                      px-4
                      py-3
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-gray-700
                      hover:bg-gray-50
                    "
                  >
                    <FiSettings />
                    Profile Settings
                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      px-4
                      py-3
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-red-500
                      hover:bg-red-50
                    "
                  >
                    <FiLogOut />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            px-3
            h-11
            bg-gray-100
            rounded-xl
          "
        >
          <FiSearch className="text-gray-400 text-lg flex-shrink-0" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search chats..."
            className="
              flex-1
              bg-transparent
              outline-none
              border-none
              text-sm
              text-gray-700
              placeholder:text-gray-400
            "
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* =================================================
            FILTER TABS
        ================================================= */}

        <div className="flex items-center gap-2 mt-4">

          <button
            type="button"
            onClick={() =>
              setActiveTab("all")
            }
            className={`
              px-4
              py-1.5
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }
            `}
          >
            All
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("unread")
            }
            className={`
              px-4
              py-1.5
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab === "unread"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }
            `}
          >
            Unread
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "favourites"
              )
            }
            className={`
              px-4
              py-1.5
              rounded-full
              text-xs
              font-medium
              transition
              ${
                activeTab === "favourites"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }
            `}
          >
            Favourites
          </button>

        </div>

      </div>

      {/* =================================================
          USERS LIST
      ================================================= */}

      <div className="flex-1 overflow-y-auto">

        {loading ? (

          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-gray-400">
              Loading chats...
            </p>
          </div>

        ) : filteredUsers.length === 0 ? (

          /* EMPTY STATE */

          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-gray-100
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FiUserPlus className="text-2xl text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-700">
              No chats yet
            </h3>

            <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
              Add a WebChat user using their Gmail to start chatting.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowAddContact(true);
                setContactError("");
                setContactSuccess("");
              }}
              className="
                mt-5
                px-4
                py-2
                rounded-lg
                bg-gray-900
                text-white
                text-xs
                font-medium
                hover:bg-gray-800
                transition
                flex
                items-center
                gap-2
              "
            >
              <FiPlus />
              Add User
            </button>

          </div>

        ) : (

          <div className="py-2">

            {filteredUsers.map(
              (user) => {

                const isSelected =
                  String(
                    selectedUser?._id
                  ) ===
                  String(user._id);

                const isOnline =
                  onlineUsers.includes(
                    String(user._id)
                  );

                const unread =
                  unreadCounts[
                    user._id
                  ] || 0;

                return (
                  <button
                    type="button"
                    key={user._id}
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

                    {/* AVATAR */}

                    <div className="relative flex-shrink-0">

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

                    {/* USER INFO */}

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
                          {user.fullName}
                        </h3>

                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTime(
                            user._id
                          )}
                        </span>

                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">

                        <p
                          className="
                            text-xs
                            text-gray-400
                            truncate
                          "
                        >
                          {user.bio ||
                            "Hey! I am using WebChat"}
                        </p>

                        {/* UNREAD */}

                        {unread > 0 && (
                          <span
                            className="
                              min-w-5
                              h-5
                              px-1.5
                              rounded-full
                              bg-gray-900
                              text-white
                              text-[10px]
                              flex
                              items-center
                              justify-center
                              flex-shrink-0
                            "
                          >
                            {unread > 99
                              ? "99+"
                              : unread}
                          </span>
                        )}

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {showAddContact && (
        <div
          className="
            absolute
            inset-0
            bg-black/30
            backdrop-blur-[2px]
            z-50
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setShowAddContact(false)
          }
        >

          <div
            className="
              w-full
              max-w-sm
              bg-white
              rounded-2xl
              shadow-2xl
              p-5
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Add User
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  Enter their registered Gmail
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddContact(false)
                }
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-gray-100
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-200
                "
              >
                <FiX />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleAddContact
              }
              className="mt-5"
            >

              <label className="text-xs font-medium text-gray-600">
                Gmail
              </label>

              <input
                type="email"
                value={contactEmail}
                onChange={(e) =>
                  setContactEmail(
                    e.target.value
                  )
                }
                placeholder="example@gmail.com"
                className="
                  mt-2
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border
                  border-gray-200
                  outline-none
                  text-sm
                  text-gray-700
                  focus:border-gray-400
                "
              />

              {/* ERROR */}

              {contactError && (
                <p className="mt-2 text-xs text-red-500">
                  {contactError}
                </p>
              )}

              {/* SUCCESS */}

              {contactSuccess && (
                <p className="mt-2 text-xs text-green-600">
                  {contactSuccess}
                </p>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={addingContact}
                className="
                  mt-4
                  w-full
                  h-11
                  rounded-xl
                  bg-gray-900
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

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Sidebar;
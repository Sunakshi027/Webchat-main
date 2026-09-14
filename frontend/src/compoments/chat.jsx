import React, { useEffect, useRef, useState } from "react";

import avtar from "../assets/avrar.jpg";
import arrow from "../assets/arrow icon.jpg";
import galary from "../assets/galary icon1.png";
import send from "../assets/sendmessage.png";
import imgmsg from "../assets/image.png";
import { formatMessageTime } from "../library/utils";

import {
  getMessages,
  sendMessage,
  markMessagesSeen,
  deleteMessage,
  updateMessage,
  toggleFavourite,
} from "../api/messageapi";

import { getCurrentUser } from "../api/userapi";

import socket from "../socket";

const Chat = ({
  selectedUser,
  setSelectedUser,
  setShowRightSidebar,
  setChatMessages,
}) => {
  const scrollEnd = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [showMenu, setShowMenu] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);

  // =====================================================
  // SEND MESSAGES TO HOME / RIGHT SIDEBAR
  // =====================================================

  useEffect(() => {
    if (setChatMessages) {
      setChatMessages(messages);
    }
  }, [messages, setChatMessages]);

  // =====================================================
  // CURRENT USER
  // =====================================================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const data = await getCurrentUser();

        const user = data?.user || data;

        setCurrentUser(user);

        console.log("👤 CURRENT USER:", user);
      } catch (error) {
        console.log(
          "Current user error:",
          error.response?.data || error.message
        );
      }
    };

    loadCurrentUser();
  }, []);

  // =====================================================
  // SOCKET ONLINE USERS
  // =====================================================

  useEffect(() => {
    const handleOnlineUsers = (userIds) => {
      if (!Array.isArray(userIds)) {
        setOnlineUsers([]);
        return;
      }

      setOnlineUsers(userIds.map((id) => String(id)));
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  // =====================================================
  // REGISTER CURRENT USER WITH SOCKET
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const registerUser = () => {
      if (!socket.connected) {
        return;
      }

      socket.emit("user-online", String(currentUser._id));

      console.log(
        "USER REGISTERED:",
        currentUser._id
      );
    };

    if (socket.connected) {
      registerUser();
    }

    socket.on("connect", registerUser);

    return () => {
      socket.off("connect", registerUser);
    };
  }, [currentUser?._id]);

  // =====================================================
  // RECEIVE NEW MESSAGE
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const handleNewMessage = (message) => {
      if (!message) {
        return;
      }

      console.log("NEW MESSAGE:", message);

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

      const myId = String(currentUser._id);

      const sender = String(senderId);
      const receiver = String(receiverId);

      const selectedId = String(
        selectedUser?._id || ""
      );

      // =================================================
      // CHECK WHETHER THIS MESSAGE BELONGS TO CURRENT CHAT
      // =================================================

      const isFromSelectedUser =
        sender === selectedId;

      const isToSelectedUser =
        receiver === selectedId;

      const isFromCurrentUser =
        sender === myId;

      const isToCurrentUser =
        receiver === myId;

      const isCurrentChat =
        (isFromSelectedUser && isToCurrentUser) ||
        (isToSelectedUser && isFromCurrentUser);

      if (!isCurrentChat) {
        console.log(
          " Message belongs to another chat"
        );

        return;
      }

      // =================================================
      // ADD MESSAGE
      // =================================================

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id &&
            message._id &&
            String(msg._id) === String(message._id)
        );

        if (exists) {
          return prev;
        }

        return [...prev, message];
      });

      // =================================================
      // IF MESSAGE RECEIVED FROM OTHER USER
      // MARK AS SEEN
      // =================================================

      if (
        sender === selectedId &&
        receiver === myId
      ) {
        markMessagesSeen(selectedUser._id)
          .then(() => {
            socket.emit("message-seen", {
              messageId: message._id,
              senderId: senderId,
            });
          })
          .catch((error) => {
            console.log(
              "Seen error:",
              error.response?.data || error.message
            );
          });
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off(
        "new-message",
        handleNewMessage
      );
    };
  }, [
    currentUser?._id,
    selectedUser?._id,
  ]);

  // =====================================================
  // MESSAGE SEEN
  // =====================================================

  useEffect(() => {
    const handleMessageSeen = ({
      messageId,
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            String(msg._id) ===
            String(messageId)
          ) {
            return {
              ...msg,
              seen: true,
            };
          }

          return msg;
        })
      );
    };

    socket.on(
      "message-seen-update",
      handleMessageSeen
    );

    return () => {
      socket.off(
        "message-seen-update",
        handleMessageSeen
      );
    };
  }, []);

  // =====================================================
  // MESSAGE DELIVERED
  // =====================================================

  useEffect(() => {
    const handleMessageDelivered = ({
      messageId,
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            String(msg._id) ===
            String(messageId)
          ) {
            return {
              ...msg,
              delivered: true,
            };
          }

          return msg;
        })
      );
    };

    socket.on(
      "message-delivered",
      handleMessageDelivered
    );

    return () => {
      socket.off(
        "message-delivered",
        handleMessageDelivered
      );
    };
  }, []);

  // =====================================================
  // LOAD MESSAGES
  // =====================================================

  useEffect(() => {
    if (!selectedUser?._id) {
      setMessages([]);

      if (setChatMessages) {
        setChatMessages([]);
      }

      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);

        const data = await getMessages(
          selectedUser._id
        );

        const messageList =
          data?.messages ||
          data ||
          [];

        setMessages(messageList);

        if (setChatMessages) {
          setChatMessages(messageList);
        }

        // =================================================
        // CHAT OPENED -> MARK ALL MESSAGES SEEN
        // =================================================

        await markMessagesSeen(
          selectedUser._id
        );

        console.log(
          "Messages marked seen"
        );
      } catch (error) {
        console.log(
          "Get messages error:",
          error.response?.data ||
            error.message
        );

        setMessages([]);

        if (setChatMessages) {
          setChatMessages([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [
    selectedUser?._id,
    setChatMessages,
  ]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = async () => {
    if (!selectedUser?._id) {
      return;
    }

    if (
      !text.trim() &&
      !selectedImage
    ) {
      return;
    }

    try {
      setSending(true);

      const data = await sendMessage(
        selectedUser._id,
        text.trim(),
        selectedImage
      );

      const newMessage =
        data?.message ||
        data;

      // =================================================
      // ADD MESSAGE LOCALLY
      // =================================================

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id &&
            newMessage?._id &&
            String(msg._id) ===
              String(newMessage._id)
        );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          newMessage,
        ];
      });

      // =================================================
      // SOCKET SEND
      // =================================================

      if (socket.connected) {
        socket.emit(
          "send-message",
          newMessage
        );
      }

      // =================================================
      // CLEAR INPUT
      // =================================================

      setText("");
      setSelectedImage(null);

      const fileInput =
        document.getElementById(
          "image"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.log(
        "Send message error:",
        error.response?.data ||
          error.message
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // ENTER TO SEND
  // =====================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleSendMessage();
    }
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeSelectedImage = () => {
    setSelectedImage(null);

    const fileInput =
      document.getElementById(
        "image"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // DELETE MESSAGE
  // =====================================================

  const deleteHandler = async (
    messageId
  ) => {
    try {
      await deleteMessage(messageId);

      setMessages((prev) =>
        prev.filter(
          (msg) =>
            String(msg._id) !==
            String(messageId)
        )
      );

      setShowMenu(null);
    } catch (error) {
      console.log(
        "Delete error:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // UPDATE MESSAGE
  // =====================================================

  const updateHandler = async (
    messageId
  ) => {
    if (!editMessage.trim()) {
      return;
    }

    try {
      const response =
        await updateMessage(
          messageId,
          editMessage.trim()
        );

      const updatedMessage =
        response?.message ||
        response?.data?.message ||
        response?.data ||
        response;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) ===
          String(messageId)
            ? {
                ...msg,
                text:
                  updatedMessage?.text ||
                  editMessage.trim(),
              }
            : msg
        )
      );

      setEditId(null);
      setEditMessage("");
      setShowMenu(null);
    } catch (error) {
      console.log(
        "Update error:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // FAVOURITE
  // =====================================================

  const favouriteHandler = async (
    messageId
  ) => {
    try {
      const response =
        await toggleFavourite(
          messageId
        );

      const updatedMessage =
        response?.message ||
        response?.data?.message ||
        response?.data ||
        response;

      setMessages((prev) =>
        prev.map((msg) => {
          if (
            String(msg._id) !==
            String(messageId)
          ) {
            return msg;
          }

          return {
            ...msg,
            isFavourite:
              updatedMessage?.isFavourite ??
              !msg.isFavourite,
          };
        })
      );

      setShowMenu(null);
    } catch (error) {
      console.log(
        "Favourite error:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // CLOSE MESSAGE MENU
  // =====================================================

  useEffect(() => {
    const closeMenu = () => {
      setShowMenu(null);
    };

    document.addEventListener(
      "click",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "click",
        closeMenu
      );
    };
  }, []);

  // =====================================================
  // NO USER SELECTED
  // =====================================================

  if (!selectedUser) {
    return (
      <div
        className="
          w-full
          h-full
          flex
          items-center
          justify-center
          bg-[#fafafa]
        "
      >
        <div className="text-center max-w-sm">
          <div
            className="
              w-20
              h-20
              mx-auto
              rounded-3xl
              bg-white
              border
              border-gray-100
              shadow-sm
              flex
              items-center
              justify-center
              text-3xl
            "
          >
            <img src={imgmsg}/>
          </div>

          <h2
            className="
              mt-6
              text-2xl
              font-semibold
              text-gray-800
            "
          >
            Your messages
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-gray-400
            "
          >
            Select a conversation
            from the left to start
            chatting.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // SELECTED USER ONLINE STATUS
  // =====================================================

  const selectedUserOnline =
    onlineUsers.includes(
      String(selectedUser._id)
    );

  // =====================================================
  // CHAT UI
  // =====================================================

  return (
    <div
      className="
        w-full
        h-full
        flex
        flex-col
        bg-[#fafafa]
        overflow-hidden
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          h-[78px]
          flex
          items-center
          justify-between
          px-4
          sm:px-6
          bg-white
          border-b
          border-gray-100
          flex-shrink-0
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
          "
        >
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              setSelectedUser(null)
            }
            className="
              md:hidden
              w-9
              h-9
              rounded-full
              hover:bg-gray-100
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >
            <img
              src={arrow}
              alt="back"
              className="
                w-5
                h-5
                object-contain
              "
            />
          </button>

          {/* PROFILE */}

          <div className="relative flex-shrink-0">
            <img
              src={
                selectedUser.profilePic ||
                avtar
              }
              alt=""
              className="
                w-11
                h-11
                sm:w-12
                sm:h-12
                rounded-full
                object-cover
                ring-1
                ring-gray-100
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
                  selectedUserOnline
                    ? "bg-green-500"
                    : "bg-gray-400"
                }
              `}
            />
          </div>

          {/* USER INFO */}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="
                  font-semibold
                  text-gray-800
                  text-sm
                  sm:text-base
                  truncate
                "
              >
                {selectedUser.fullName}
              </p>

              <span
                className={`
                  w-1.5
                  h-1.5
                  rounded-full
                  flex-shrink-0
                  ${
                    selectedUserOnline
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }
                `}
              />
            </div>

            <p
              className={`
                text-xs
                font-medium
                ${
                  selectedUserOnline
                    ? "text-green-500"
                    : "text-gray-400"
                }
              `}
            >
              {selectedUserOnline
                ? "Active now"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}

        <button
          type="button"
          onClick={() =>
            setShowRightSidebar(true)
          }
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            border
            border-gray-100
            bg-white
            text-gray-500
            hover:bg-gray-50
            hover:text-gray-800
            transition
            flex
            items-center
            justify-center
            text-xl
            flex-shrink-0
          "
        >
          ⋮
        </button>
      </div>

      {/* =================================================
          MESSAGE AREA
      ================================================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          sm:px-6
          py-5
          scrollbar-thin
          scrollbar-thumb-gray-300
          scrollbar-track-transparent
        "
      >
        {loading ? (
          <div
            className="
              h-full
              flex
              items-center
              justify-center
            "
          >
            <div className="text-sm text-gray-400">
              Loading messages...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div
            className="
              h-full
              flex
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-full
                  bg-white
                  border
                  border-gray-100
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                👋
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                  text-gray-600
                "
              >
                Say hello to{" "}
                {selectedUser.fullName}
              </p>

              <p
                className="
                  text-xs
                  text-gray-400
                  mt-1
                "
              >
                Start a new
                conversation
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              max-w-4xl
              mx-auto
              flex
              flex-col
              gap-5
            "
          >
            {messages.map(
              (msg, index) => {
                const senderId =
                  msg.senderId?._id ||
                  msg.senderId ||
                  msg.sender?._id ||
                  msg.sender ||
                  "";

                const isMe =
                  String(senderId) ===
                  String(currentUser?._id);

                return (
                  <div
                    key={
                      msg._id ||
                      index
                    }
                    className={`
                      flex
                      items-end
                      gap-2.5
                      group
                      ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >
                    {/* OTHER USER AVATAR */}

                    {!isMe && (
                      <img
                        src={
                          selectedUser.profilePic ||
                          avtar
                        }
                        alt=""
                        className="
                          w-8
                          h-8
                          rounded-full
                          object-cover
                          flex-shrink-0
                        "
                      />
                    )}

                    <div
                      className="
                        relative
                        max-w-[75%]
                        sm:max-w-[65%]
                      "
                    >
                      {/* FAVOURITE */}

                      {msg.isFavourite && (
                        <div
                          className="
                            absolute
                            -top-2
                            -right-2
                            z-20
                            w-6
                            h-6
                            rounded-full
                            bg-white
                            border
                            border-gray-100
                            shadow-sm
                            flex
                            items-center
                            justify-center
                            text-yellow-500
                            text-xs
                          "
                        >
                          ★
                        </div>
                      )}

                      {/* MENU */}

                      {isMe && (
                     <div 
  className="
    absolute 
    -right-10 
    top-[20px] 
    -translate-y-1/2 
    z-40
  "

                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setShowMenu(
                                showMenu ===
                                  msg._id
                                  ? null
                                  : msg._id
                              )
                            }
                            className="
                              w-8
                              h-8
                              rounded-full
                              bg-white
                              border
                              border-gray-100
                              shadow-sm
                              text-gray-400
                              hover:text-gray-700
                              hover:shadow
                              transition
                              flex
                              items-center
                              justify-center
                            "
                          >
                            ⋮
                          </button>

                          {showMenu ===
                            msg._id && (
                            <div
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className="
                                absolute
                                right-0
                                top-9
                                w-40
                                bg-white
                                border
                                border-gray-100
                                rounded-2xl
                                shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                                p-1.5
                                overflow-hidden
                              "
                            >
                              {/* FAVOURITE */}

                              <button
                                type="button"
                                onClick={() =>
                                  favouriteHandler(
                                    msg._id
                                  )
                                }
                                className="
                                  w-full
                                  px-3
                                  py-2.5
                                  rounded-xl
                                  text-left
                                  text-sm
                                  text-gray-700
                                  hover:bg-gray-50
                                "
                              >
                                <span className="mr-2">
                                  {msg.isFavourite
                                    ? "★"
                                    : "☆"}
                                </span>

                                {msg.isFavourite
                                  ? "Unfavourite"
                                  : "Favourite"}
                              </button>

                              {/* UPDATE */}

                              {!msg.image && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditId(
                                      msg._id
                                    );

                                    setEditMessage(
                                      msg.text ||
                                        ""
                                    );

                                    setShowMenu(
                                      null
                                    );
                                  }}
                                  className="
                                    w-full
                                    px-3
                                    py-2.5
                                    rounded-xl
                                    text-left
                                    text-sm
                                    text-gray-700
                                    hover:bg-gray-50
                                  "
                                >
                                  <span className="mr-2">
                                    ✎
                                  </span>

                                  Update
                                </button>
                              )}

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteHandler(
                                    msg._id
                                  )
                                }
                                className="
                                  w-full
                                  px-3
                                  py-2.5
                                  rounded-xl
                                  text-left
                                  text-sm
                                  text-red-500
                                  hover:bg-red-50
                                "
                              >
                                <span className="mr-2">
                                  ×
                                </span>

                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* IMAGE */}

                      {msg.image && (
                        <div
                          className={`
                            overflow-hidden
                            rounded-2xl
                            ${
                              isMe
                                ? "rounded-br-md"
                                : "rounded-bl-md"
                            }
                          `}
                        >
                          <img
                            src={msg.image}
                            alt="message"
                            className="
                              max-w-[300px]
                              max-h-[350px]
                              object-cover
                              block
                              shadow-sm
                            "
                          />
                        </div>
                      )}

                      {/* EDIT MODE */}

                      {editId ===
                      msg._id ? (
                        <div
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-2
                            shadow-lg
                            w-[280px]
                          "
                        >
                          <input
                            autoFocus
                            type="text"
                            value={
                              editMessage
                            }
                            onChange={(e) =>
                              setEditMessage(
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key ===
                                "Enter"
                              ) {
                                updateHandler(
                                  msg._id
                                );
                              }

                              if (
                                e.key ===
                                "Escape"
                              ) {
                                setEditId(
                                  null
                                );

                                setEditMessage(
                                  ""
                                );
                              }
                            }}
                            className="
                              w-full
                              h-10
                              px-3
                              rounded-xl
                              bg-gray-50
                              border
                              border-gray-100
                              outline-none
                              text-sm
                              text-gray-700
                            "
                          />

                          <div
                            className="
                              flex
                              justify-end
                              gap-2
                              mt-2
                            "
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditId(
                                  null
                                );

                                setEditMessage(
                                  ""
                                );
                              }}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                text-gray-500
                                hover:bg-gray-100
                              "
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateHandler(
                                  msg._id
                                )
                              }
                              className="
                                px-4
                                py-1.5
                                rounded-lg
                                text-xs
                                bg-black
                                text-white
                                hover:bg-gray-800
                              "
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.text && (
                          <div
                            className={`
                              px-4
                              py-3
                              text-[14px]
                              leading-6
                              break-words
                              shadow-sm
                              ${
                                isMe
                                  ? "bg-[#2563eb] text-white rounded-2xl rounded-br-md"
                                  : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-md"
                              }
                            `}
                          >
                            {msg.text}
                          </div>
                        )
                      )}

                      {/* TIME */}

                      <div
                        className={`
                          flex
                          items-center
                          gap-1.5
                          mt-1.5
                          px-1
                          ${
                            isMe
                              ? "justify-end"
                              : "justify-start"
                          }
                        `}
                      >
                        <span
                          className="
                            text-[10px]
                            text-gray-400
                          "
                        >
                          {formatMessageTime(
                            msg.createdAt
                          )}
                        </span>

                        {isMe && (
                          <span
                            className={`
                              text-[11px]
                              ${
                                msg.seen
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {msg.seen
                              ? "✓✓"
                              : "✓"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MY AVATAR */}

                    {isMe && (
                      <img
                        src={
                          currentUser?.profilePic ||
                          avtar
                        }
                        alt=""
                        className="
                          w-8
                          h-8
                          rounded-full
                          object-cover
                          flex-shrink-0
                        "
                      />
                    )}
                  </div>
                );
              }
            )}

            <div ref={scrollEnd} />
          </div>
        )}
      </div>

      {/* =================================================
          IMAGE PREVIEW
      ================================================= */}

      {selectedImage && (
        <div
          className="
            px-5
            sm:px-8
            py-3
            bg-white
            border-t
            border-gray-100
          "
        >
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(
                selectedImage
              )}
              alt="preview"
              className="
                w-20
                h-20
                object-cover
                rounded-xl
                border
                border-gray-100
              "
            />

            <button
              type="button"
              onClick={
                removeSelectedImage
              }
              className="
                absolute
                -top-2
                -right-2
                w-6
                h-6
                rounded-full
                bg-black
                text-white
                flex
                items-center
                justify-center
                text-sm
                shadow
              "
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          INPUT
      ================================================= */}

      <div
        className="
          px-3
          sm:px-6
          py-3
          sm:py-4
          bg-white
          border-t
          border-gray-100
          flex-shrink-0
        "
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="
              flex
              items-center
              gap-2
              p-1.5
              bg-gray-50
              border
              border-gray-200
              rounded-2xl
              focus-within:bg-white
              focus-within:border-blue-200
              focus-within:shadow-[0_5px_25px_rgba(0,0,0,0.05)]
              transition
            "
          >
            {/* GALLERY */}

            <label
              htmlFor="image"
              className="
                w-10
                h-10
                rounded-xl
                cursor-pointer
                flex
                items-center
                justify-center
                hover:bg-gray-100
                transition
                flex-shrink-0
              "
            >
              <img
                src={galary}
                alt="gallery"
                className="
                  w-5
                  h-5
                  object-contain
                  opacity-60
                "
              />
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              className="hidden"
            />

            {/* TEXT */}

            <input
              type="text"
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Write a message..."
              className="
                flex-1
                min-w-0
                bg-transparent
                outline-none
                px-2
                text-sm
                text-gray-700
                placeholder-gray-400
              "
            />

            {/* SEND */}

            <button
              type="button"
              onClick={
                handleSendMessage
              }
              disabled={sending}
              className="
                w-10
                h-10
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                transition
                flex-shrink-0
              "
            >
              <img
                src={send}
                alt="send"
                className="
                  w-5
                  h-5
                  object-contain
                "
              />
            </button>
          </div>

          <p
            className="
              text-[10px]
              text-gray-300
              text-center
              mt-2
            "
          >
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
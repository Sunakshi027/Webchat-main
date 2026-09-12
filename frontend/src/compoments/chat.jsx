import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import avtar from "../assets/avrar.jpg";
import { imagesDummyData } from "../assests";

import socket from "../socket";

import {
  getMessages,
  sendMessage,
  markMessagesSeen,
  deleteMessage,
  updateMessage,
  toggleFavourite,
} from "../api/messageapi";

const Chat = ({
  selectedUser,
  setShowRightSidebar,
  currentUser,
}) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [editingMessageId, setEditingMessageId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // =====================================================
  // FORMAT MESSAGE TIME
  // =====================================================

  const formatMessageTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // GET MESSAGES
  // =====================================================

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;

      try {
        const response = await getMessages(
          selectedUser._id
        );

        const messageList =
          response?.messages ||
          response?.data ||
          response ||
          [];

        setMessages(
          Array.isArray(messageList)
            ? messageList
            : []
        );

        await markMessagesSeen(
          selectedUser._id
        );
      } catch (error) {
        console.log(
          "GET MESSAGES ERROR:",
          error.response?.data ||
            error.message
        );
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  // =====================================================
  // SOCKET - USER ONLINE
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit(
      "user-online",
      currentUser._id
    );

    console.log(
      "Socket user online:",
      currentUser._id
    );
  }, [currentUser?._id]);

  // =====================================================
  // SOCKET - RECEIVE NEW MESSAGE
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) return;

    const handleNewMessage = (message) => {
      if (!message) return;

      console.log(
        "NEW REAL TIME MESSAGE:",
        message
      );

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

      // Check current conversation
      const isCurrentChat =
        String(senderId) ===
          String(selectedUser?._id) ||
        String(receiverId) ===
          String(selectedUser?._id);

      if (!isCurrentChat) return;

      setMessages((prev) => {
        // Prevent duplicate messages
        const alreadyExists = prev.some(
          (msg) =>
            msg._id &&
            message._id &&
            String(msg._id) ===
              String(message._id)
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, message];
      });

      // Mark incoming messages as seen
      if (
        String(senderId) ===
        String(selectedUser?._id)
      ) {
        markMessagesSeen(
          selectedUser._id
        ).catch((error) => {
          console.log(
            "SEEN ERROR:",
            error.response?.data ||
              error.message
          );
        });
      }
    };

    socket.on(
      "new-message",
      handleNewMessage
    );

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
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = async () => {
    if (
      !selectedUser?._id ||
      (!text.trim() && !selectedImage)
    ) {
      return;
    }

    try {
      const data = await sendMessage(
        selectedUser._id,
        text.trim(),
        selectedImage
      );

      const newMessage =
        data?.message || data;

      console.log(
        "MESSAGE SENT:",
        newMessage
      );

      // Add message immediately for sender
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) =>
            msg._id &&
            newMessage?._id &&
            String(msg._id) ===
              String(newMessage._id)
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, newMessage];
      });

      // Send through Socket.IO
      socket.emit(
        "send-message",
        newMessage
      );

      setText("");
      setSelectedImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log(
        "SEND MESSAGE ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSendMessage();
    }
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
  };

  // =====================================================
  // DELETE MESSAGE
  // =====================================================

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);

      setMessages((prev) =>
        prev.filter(
          (msg) =>
            String(msg._id) !==
            String(messageId)
        )
      );
    } catch (error) {
      console.log(
        "DELETE ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const handleEdit = (message) => {
    setEditingMessageId(message._id);

    setEditingText(
      message.text || ""
    );
  };

  // =====================================================
  // UPDATE MESSAGE
  // =====================================================

  const handleUpdate = async (
    messageId
  ) => {
    if (!editingText.trim()) return;

    try {
      const response =
        await updateMessage(
          messageId,
          editingText.trim()
        );

      const updatedMessage =
        response?.message ||
        response?.data ||
        response;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) ===
          String(messageId)
            ? {
                ...msg,
                ...(updatedMessage || {}),
                text:
                  updatedMessage?.text ||
                  editingText.trim(),
              }
            : msg
        )
      );

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.log(
        "UPDATE ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // =====================================================
  // FAVOURITE MESSAGE
  // =====================================================

  const handleFavourite = async (
    messageId
  ) => {
    try {
      const response =
        await toggleFavourite(messageId);

      const updatedMessage =
        response?.message ||
        response?.data ||
        response;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) ===
          String(messageId)
            ? {
                ...msg,
                ...(updatedMessage || {}),
                isFavourite:
                  updatedMessage?.isFavourite ??
                  !msg.isFavourite,
              }
            : msg
        )
      );
    } catch (error) {
      console.log(
        "FAVOURITE ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // =====================================================
  // PROFILE / RIGHT SIDEBAR
  // =====================================================

  const handleProfile = () => {
    if (!selectedUser) return;

    setShowRightSidebar?.(true);
  };

  // =====================================================
  // NO USER SELECTED
  // =====================================================

  if (!selectedUser) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <p className="text-gray-400">
          Select a user to start chatting
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN CHAT
  // =====================================================

  return (
    <div className="w-full h-full bg-white flex flex-col">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="h-[70px] shrink-0 border-b border-gray-200 flex items-center justify-between px-4">

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleProfile}
        >

          <div className="relative">

            <img
              src={
                selectedUser.profilePic ||
                avtar
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />

            {selectedUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}

          </div>

          <div>

            <h3 className="font-semibold text-gray-800">
              {selectedUser.name ||
                selectedUser.fullName ||
                "User"}
            </h3>

            <p className="text-xs text-gray-500">
              {selectedUser.isOnline
                ? "Online"
                : "Offline"}
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            setShowRightSidebar?.(true)
          }
          className="text-xl text-gray-500"
        >
          ⋮
        </button>

      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      <div className="flex-1 overflow-y-auto p-4">

        <div className="space-y-4">

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
                    `${index}-${msg.createdAt}`
                  }
                  className={`flex items-end gap-2.5 group ${
                    isMe
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {/* OTHER USER AVATAR */}

                  {!isMe && (
                    <img
                      src={
                        selectedUser.profilePic ||
                        avtar
                      }
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  )}

                  {/* MESSAGE */}

                  <div
                    className={`max-w-[75%] flex flex-col ${
                      isMe
                        ? "items-end"
                        : "items-start"
                    }`}
                  >

                    {/* EDIT MODE */}

                    {editingMessageId ===
                    msg._id ? (
                      <div className="flex flex-col gap-2">

                        <textarea
                          value={editingText}
                          onChange={(e) =>
                            setEditingText(
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-xl px-3 py-2 outline-none resize-none min-w-[220px]"
                          rows="2"
                          autoFocus
                        />

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              handleUpdate(
                                msg._id
                              )
                            }
                            className="px-3 py-1 bg-black text-white rounded-lg text-xs"
                          >
                            Save
                          </button>

                          <button
                            onClick={
                              handleCancelEdit
                            }
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>
                    ) : (
                      <div
                        className={`relative px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? "bg-black text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >

                        {/* TEXT */}

                        {msg.text && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}

                        {/* IMAGE */}

                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="message"
                            className="mt-1 max-w-[260px] max-h-[300px] rounded-xl object-cover"
                          />
                        )}

                        {/* TIME */}

                        <div
                          className={`text-[10px] mt-1 text-right ${
                            isMe
                              ? "text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(
                            msg.createdAt
                          )}
                        </div>

                        {/* MESSAGE ACTIONS */}

                        <div
                          className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 ${
                            isMe
                              ? "right-full mr-2"
                              : "left-full ml-2"
                          }`}
                        >

                          {/* FAVOURITE */}

                          <button
                            onClick={() =>
                              handleFavourite(
                                msg._id
                              )
                            }
                            className="w-7 h-7 bg-white border border-gray-200 rounded-full shadow text-xs"
                            title="Favourite"
                          >
                            {msg.isFavourite
                              ? "★"
                              : "☆"}
                          </button>

                          {/* EDIT */}

                          {isMe && (
                            <button
                              onClick={() =>
                                handleEdit(msg)
                              }
                              className="w-7 h-7 bg-white border border-gray-200 rounded-full shadow text-xs"
                              title="Edit"
                            >
                              ✎
                            </button>
                          )}

                          {/* DELETE */}

                          {isMe && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  msg._id
                                )
                              }
                              className="w-7 h-7 bg-white border border-gray-200 rounded-full shadow text-xs"
                              title="Delete"
                            >
                              🗑
                            </button>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                </div>
              );
            }
          )}

          {/* AUTO SCROLL */}

          <div ref={messagesEndRef} />

        </div>

      </div>

      {/* =================================================
          IMAGE PREVIEW
      ================================================= */}

      {selectedImage && (
        <div className="px-4 pb-2">

          <div className="relative inline-block">

            <img
              src={URL.createObjectURL(
                selectedImage
              )}
              alt="preview"
              className="w-20 h-20 rounded-xl object-cover border"
            />

            <button
              onClick={() => {
                setSelectedImage(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value =
                    "";
                }
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-white text-xs"
            >
              ×
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="shrink-0 border-t border-gray-200 p-3">

        <div className="flex items-end gap-2">

          {/* IMAGE */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <span className="text-xl">
              +
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          {/* TEXT */}

          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows="1"
            className="flex-1 min-h-[42px] max-h-[120px] resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />

          {/* SEND */}

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={
              !text.trim() &&
              !selectedImage
            }
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-40"
          >
            ➤
          </button>

        </div>

      </div>

    </div>
  );
};

export default Chat;
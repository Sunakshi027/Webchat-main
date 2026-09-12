<<<<<<< HEAD
import { useEffect, useRef } from "react";
import avtar from "../assets/avrar.jpg";
import arrow from "../assets/arrow icon.jpg";
import { messagesDummyData } from "../assests";
import { formatMessageTime } from "../library/utils";
import galary from "../assets/galary icon1.png";
import send from "../assets/sendmessage.png";
import icom from "../assets/image.png";
import { useNavigate } from "react-router-dom";

const Chat = ({ selectedUser, setSelectedUser,setShowRightSidebar }) => {
  const scrollEnd = useRef();
    const navigate = useNavigate();
  
  // ================= SCROLL TO LAST MESSAGE =================
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({
        behavior: "smooth",
      });
=======
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import avtar from "../assets/avrar.jpg";
import arrow from "../assets/arrow icon.jpg";
import galary from "../assets/galary icon1.png";
import send from "../assets/sendmessage.png";

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

const Chat = ({
  selectedUser,
  setSelectedUser,
  setShowRightSidebar,
}) => {

  const scrollEnd = useRef(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(null);

  const [editId, setEditId] =
    useState(null);

  const [editMessage, setEditMessage] =
    useState("");

  // ==========================================
  // CURRENT USER
  // ==========================================

  useEffect(() => {

    const loadCurrentUser =
      async () => {

        try {

          const data =
            await getCurrentUser();

          const user =
            data?.user ||
            data;

          setCurrentUser(user);

        } catch (error) {

          console.log(
            "Current user error:",
            error.response?.data ||
              error.message
          );

        }
      };

    loadCurrentUser();

  }, []);

  // ==========================================
  // LOAD MESSAGES
  // ==========================================

  useEffect(() => {

    if (!selectedUser?._id) {
      return;
>>>>>>> 1f2d71e (Initial Webchat project)
    }

<<<<<<< HEAD
  return selectedUser ? (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
       <div
  onClick={() => {
    if (window.innerWidth < 768) {
      setShowRightSidebar(true);
    }
  }}
  className="
    h-[72px]
    flex items-center justify-between
    px-4 sm:px-5
    bg-white
    border-b border-gray-200
    transition-all duration-300
    cursor-pointer
    md:cursor-default
  "
>
  {/* ================= USER INFO ================= */}
  <div className="flex items-center gap-3 min-w-0">

    {/* Profile Image */}
    <div className="relative group flex-shrink-0">

      <img
        src={selectedUser.profilePic}
        alt="profile"
        className="
          w-11 h-11
          rounded-full
          object-cover
          border-2 border-white
          shadow-sm
          transition-all duration-300
          group-hover:scale-105
          group-hover:shadow-md
        "
      />

      {/* Online / Offline Dot */}
      <span
        className={`
          absolute
          bottom-0
          right-0
          w-3.5
          h-3.5
          rounded-full
          border-2
          border-white
          ${
            selectedUser.isOnline
              ? "bg-green-500"
              : "bg-gray-400"
          }
        `}
      ></span>

    </div>

    {/* Name + Status */}
    <div className="min-w-0">
=======
    const loadMessages =
      async () => {

        try {

          setLoading(true);

          const data =
            await getMessages(
              selectedUser._id
            );

          const messageList =
            data?.messages ||
            data ||
            [];

          /*
            Mark incoming messages
            as seen locally.
          */

          const updatedMessages =
            messageList.map(
              (msg) => {

                const senderId =
                  msg.senderId?._id ||
                  msg.senderId ||
                  msg.sender?._id ||
                  msg.sender ||
                  "";

                if (
                  String(senderId) ===
                  String(
                    selectedUser._id
                  )
                ) {
                  return {
                    ...msg,
                    seen: true,
                  };
                }

                return msg;
              }
            );

          setMessages(
            updatedMessages
          );

          await markMessagesSeen(
            selectedUser._id
          );

        } catch (error) {

          console.log(
            "Get messages error:",
            error.response?.data ||
              error.message
          );

          setMessages([]);

        } finally {

          setLoading(false);

        }
      };

    loadMessages();

  }, [selectedUser?._id]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {

    if (scrollEnd.current) {

      scrollEnd.current.scrollIntoView(
        {
          behavior: "smooth",
        }
      );

    }

  }, [messages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage =
    async () => {

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

        const data =
          await sendMessage(
            selectedUser._id,
            text.trim(),
            selectedImage
          );

        const newMessage =
          data?.message ||
          data;

        setMessages((prev) => [
          ...prev,
          newMessage,
        ]);

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

  // ==========================================
  // ENTER SEND
  // ==========================================

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      handleSendMessage();

    }
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (
    e
  ) => {

    const file =
      e.target.files[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeSelectedImage =
    () => {

      setSelectedImage(null);

      const fileInput =
        document.getElementById(
          "image"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteHandler =
    async (messageId) => {

      try {

        await deleteMessage(
          messageId
        );

        setMessages((prev) =>
          prev.filter(
            (msg) =>
              msg._id !==
              messageId
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

  // ==========================================
  // UPDATE
  // ==========================================

  const updateHandler =
    async (messageId) => {

      if (!editMessage.trim()) {
        return;
      }

      try {

        await updateMessage(
          messageId,
          editMessage.trim()
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  text:
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

  // ==========================================
  // FAVOURITE
  // ==========================================

  const favouriteHandler =
    async (messageId) => {

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
              msg._id !== messageId
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

  // ==========================================
  // CLOSE MENU
  // ==========================================

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

  // ==========================================
  // NO USER
  // ==========================================

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

        <div
          className="
            text-center
            max-w-sm
          "
        >

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
            💬
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

  // ==========================================
  // CHAT UI
  // ==========================================

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

      {/* =====================================
          HEADER
      ====================================== */}

      <div
        className="
          h-[78px]
          flex
          items-center
          justify-between
          px-6
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

          {/* MOBILE BACK */}

          <button
            type="button"
            onClick={() =>
              setSelectedUser(null)
            }
            className="
              lg:hidden
              w-9
              h-9
              rounded-full
              hover:bg-gray-100
              flex
              items-center
              justify-center
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

          <div className="relative">

            <img
              src={
                selectedUser.profilePic ||
                avtar
              }
              alt=""
              className="
                w-12
                h-12
                rounded-full
                object-cover
                ring-1
                ring-gray-100
              "
            />

            <span
              className="
                absolute
                bottom-0
                right-0
                w-3
                h-3
                rounded-full
                bg-green-500
                border-2
                border-white
              "
            />
>>>>>>> 1f2d71e (Initial Webchat project)

      <p
        className="
          font-semibold
          text-gray-800
          text-sm sm:text-base
          truncate
        "
      >
        {selectedUser.fullName}
      </p>

<<<<<<< HEAD
      <p
        className={`
          text-xs
          font-medium
          ${
            selectedUser.isOnline
              ? "text-green-500"
              : "text-gray-400"
          }
        `}
      >
        {selectedUser.isOnline
          ? "Active now"
          : "Offline"}
      </p>

    </div>

  </div>
        {/* ================= BACK BUTTON ================= */}
=======
          <div className="min-w-0">

            <h3
              className="
                text-[15px]
                font-semibold
                text-gray-800
                truncate
              "
            >
              {selectedUser.fullName}
            </h3>

            <div
              className="
                flex
                items-center
                gap-1.5
                mt-1
              "
            >

              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-green-500
                "
              />

              <p
                className="
                  text-[11px]
                  text-gray-400
                "
              >
                Active now
              </p>

            </div>

          </div>

        </div>

        {/* HEADER ACTION */}

>>>>>>> 1f2d71e (Initial Webchat project)
        <button
          type="button"
          onClick={() =>
            setShowRightSidebar(
              true
            )
          }
          className="
<<<<<<< HEAD
            md:hidden
            w-9 h-9
            flex-shrink-0
            rounded-full
            flex items-center justify-center
            hover:bg-gray-100
            transition-all duration-300
            active:scale-90
          "
        >
          <img
            src={arrow}
            alt="back"
            className="
              w-5 h-5
              object-contain
            "
          />
=======
            w-10
            h-10
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
          "
        >
          ⋮
>>>>>>> 1f2d71e (Initial Webchat project)
        </button>

      </div>

      {/* =====================================
          MESSAGE AREA
      ====================================== */}

<<<<<<< HEAD
      {/* ================= MESSAGES ================= */}
      <div
        className="
          flex-1
          px-3 sm:px-4 md:px-6
          py-5
          overflow-y-auto
          bg-[#f8fafc]
          space-y-4
          scrollbar-thin
          scrollbar-thumb-gray-300
          scrollbar-track-transparent
=======
      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          sm:px-8
          py-7
>>>>>>> 1f2d71e (Initial Webchat project)
        "
      >

        {loading ? (

<<<<<<< HEAD
          // ================= CHECK MY MESSAGE =================
          const isMe =
            msg.senderId === "680f50e4f10f3cd28382ecf9";
=======
          <div
            className="
              h-full
              flex
              items-center
              justify-center
            "
          >
>>>>>>> 1f2d71e (Initial Webchat project)

            <div
<<<<<<< HEAD
              key={index}
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

              {/* ================= OTHER USER AVATAR ================= */}
              {!isMe && (
                <img
                  src={selectedUser.profilePic}
                  alt=""
                  className="
                    w-8 h-8
                    rounded-full
                    object-cover
                    shadow-sm
                    flex-shrink-0
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                />
              )}


              {/* ================= IMAGE MESSAGE ================= */}
              {msg.image ? (

                <div className="max-w-[220px] sm:max-w-[260px]">
=======
              className="
                text-sm
                text-gray-400
              "
            >
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

            <div
              className="
                text-center
              "
            >

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
                Start a new conversation
              </p>
>>>>>>> 1f2d71e (Initial Webchat project)

            </div>

<<<<<<< HEAD
                  <p
                    className={`
                      text-[10px]
                      text-gray-400
                      mt-1
                      ${
                        isMe
                          ? "text-right"
                          : "text-left"
                      }
                    `}
                  >
                    {formatMessageTime(
                      msg.createdAt
                    )}
                  </p>
=======
          </div>
>>>>>>> 1f2d71e (Initial Webchat project)

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

<<<<<<< HEAD
                /* ================= TEXT MESSAGE ================= */
                <div className="max-w-[78%] sm:max-w-[75%] md:max-w-[60%]">
=======
            {messages.map(
              (msg, index) => {
>>>>>>> 1f2d71e (Initial Webchat project)

                const senderId =
                  msg.senderId?._id ||
                  msg.senderId ||
                  msg.sender?._id ||
                  msg.sender ||
                  "";

                const isMe =
                  String(senderId) ===
                  String(
                    currentUser?._id
                  );

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

<<<<<<< HEAD
                  <p
                    className={`
                      text-[10px]
                      text-gray-400
                      mt-1
                      ${
                        isMe
                          ? "text-right"
                          : "text-left"
                      }
                    `}
                  >
                    {formatMessageTime(
                      msg.createdAt
                    )}
                  </p>
=======
                    {/* OTHER AVATAR */}
>>>>>>> 1f2d71e (Initial Webchat project)

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

                    {/* MESSAGE */}

<<<<<<< HEAD

              {/* ================= MY AVATAR ================= */}
              {isMe && (
                <img
                  src={avtar}
                  alt=""
                  className="
                    w-8 h-8
                    rounded-full
                    object-cover
                    shadow-sm
                    flex-shrink-0
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                />
              )}
=======
                    <div
                      className={`
                        relative
                        max-w-[75%]
                        sm:max-w-[65%]
                      `}
                    >
>>>>>>> 1f2d71e (Initial Webchat project)

                      {/* FAVOURITE */}

<<<<<<< HEAD
        {/* Scroll Reference */}
        <div ref={scrollEnd}></div>
=======
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
                          title="Favourite"
                        >
                          ★
                        </div>
                      )}

                      {/* THREE DOT */}

                      {isMe && (
                        <div
                          className="
                            absolute
                            -left-10
                            top-1/2
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

                          {/* MENU */}

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
                                  transition
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
                                    transition
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
                                  transition
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

                      {/* EDIT */}

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
                              focus:border-blue-300
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
                                  ? `
                                    bg-[#2563eb]
                                    text-white
                                    rounded-2xl
                                    rounded-br-md
                                  `
                                  : `
                                    bg-white
                                    text-gray-700
                                    border
                                    border-gray-100
                                    rounded-2xl
                                    rounded-bl-md
                                  `
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

                        {/* SEEN */}

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
>>>>>>> 1f2d71e (Initial Webchat project)

      </div>

      {/* =====================================
          IMAGE PREVIEW
      ====================================== */}

<<<<<<< HEAD
      {/* ================= MESSAGE INPUT ================= */}
      <div
        className="
          relative
          px-3 sm:px-4
          py-3
          bg-white
          border-t border-gray-200
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            bg-gray-100
            rounded-full
            px-4
            py-1.5
            pr-14
            border border-transparent
            transition-all duration-300
            focus-within:bg-white
            focus-within:border-blue-400
            focus-within:ring-2
            focus-within:ring-blue-100
          "
        >

          {/* ================= INPUT ================= */}
          <input
            type="text"
            placeholder="Write a message..."
            className="
              flex-1
              min-w-0
              bg-transparent
              outline-none
              text-sm
              text-gray-700
              placeholder-gray-400
              py-2
            "
          />


          {/* ================= IMAGE INPUT ================= */}
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
          />

          <label
            htmlFor="image"
            className="
              w-9 h-9
              flex-shrink-0
              rounded-full
              flex items-center
              justify-center
              cursor-pointer
              transition-all duration-300
              hover:bg-gray-200
              hover:scale-105
              active:scale-90
=======
      {selectedImage && (

        <div
          className="
            px-6
            py-3
            bg-white
            border-t
            border-gray-100
          "
        >

          <div
            className="
              relative
              inline-block
>>>>>>> 1f2d71e (Initial Webchat project)
            "
          >

            <img
<<<<<<< HEAD
              src={galary}
              alt="gallery"
              className="
                w-5 h-5
                object-contain
                opacity-70
              "
            />
            <button className="text-[10px]">Voice</button>
          </label>

        </div>


        {/* ================= SEND BUTTON ================= */}

        <button
          type="button"
          className="
            absolute
            right-5
            bottom-4
            w-11 h-11
            rounded-full
            bg-blue-600
            flex items-center
            justify-center
            shadow-md
            hover:bg-blue-700
            hover:scale-105
            hover:shadow-lg
            active:scale-90
            transition-all duration-300
          "
        >
          <img
            src={send}
            alt="send"
            className="
              w-5 h-5 
              object-contain
            "
          />
        </button>

      </div>

    </div>
  ) : (

    /* ================= EMPTY CHAT ================= */
    <div
      className="
        w-full
        h-full
        flex
        flex-col
        items-center
        justify-center
        bg-[#f8fafc]
        px-6
        text-center
      "
    >

      <div
        className="
          w-24 h-24 sm:w-28 sm:h-28
          rounded-full
          bg-white
          flex items-center justify-center
          shadow-sm
          border border-gray-100
          mb-5
          transition-all duration-500
          hover:scale-105
          hover:shadow-md
        "
      >

        <img
          src={icom}
          alt=""
          className="
            w-16 h-16 sm:w-20 sm:h-20
            object-contain
            transition-transform duration-500
            hover:scale-110
          "
        />

      </div>


      <h2
        className="
          text-lg sm:text-xl
          font-semibold
          text-gray-800
          mb-2
        "
      >
        Welcome to WebChat
      </h2>


      <p
        className="
          text-sm
          text-gray-500
          max-w-sm
          leading-relaxed
        "
      >
        Select a conversation from the sidebar
        to start chatting with your friends.
      </p>

    </div>
=======
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

      {/* =====================================
          MESSAGE INPUT
      ====================================== */}

      <div
        className="
          px-5
          sm:px-8
          py-4
          bg-white
          border-t
          border-gray-100
          flex-shrink-0
        "
      >

        <div
          className="
            max-w-4xl
            mx-auto
          "
        >

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

            {/* INPUT */}

            <input
              type="text"
              value={text}
              onChange={(e) =>
                setText(
                  e.target.value
                )
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
>>>>>>> 1f2d71e (Initial Webchat project)
  );
};

export default Chat;
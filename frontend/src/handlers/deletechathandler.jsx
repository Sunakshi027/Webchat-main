import React, { useState } from "react";

function DeleteChatHandler() {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "sunakshi",
      message: "hello",
    },
    {
      id: 2,
      name: "rahul",
      message: "hi",
    },
  ]);

  const deleteChat = (chatId) => {
    setChats((prevChats) =>
      prevChats.filter((chat) => chat.id !== chatId)
    );
  };

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat.id}>
          <h3>{chat.name}</h3>
          <p>{chat.message}</p>

          <button
            onClick={() => deleteChat(chat.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default DeleteChatHandler;
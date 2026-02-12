import React from 'react';
import { createChatBotMessage } from "../lib/index";
import CustomChatMessage from "./CustomChatMessage";

const config = (initialMessage = "Hi! How can I help you today?", isLoading = false) => ({
  initialMessages: [
    createChatBotMessage(initialMessage, { payload: { loading: isLoading } })
  ],
  botName: "Spark",
  customComponents: {
    botChatMessage: (props) => <CustomChatMessage {...props} />,
  },
  customStyles: {
    botMessageBox: {
      backgroundColor: "#2563eb",
    },
    chatButton: {
      backgroundColor: "#3b82f6",
    },
  },
});

export default config;

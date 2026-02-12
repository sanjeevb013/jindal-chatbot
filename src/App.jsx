import React, { useEffect, useState } from 'react';
import Chatbot from './lib/index';
import config from './chatbot/config.jsx';
import MessageParser from './chatbot/MessageParser.jsx';
import ActionProvider from './chatbot/ActionProvider.jsx';
import { authenticateTenant, startConversation, endConversation } from './api';

import './App.css';

function App({state}) {

  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMessage, setInitialMessage] = useState("Hi! How can I help you today?");

  useEffect(() => {
    const initializeChat = async () => {
      if (showChatbot) {
        setIsLoading(true); // Start loading
        let token = localStorage.getItem("authToken");
        if (!token) {
          try {
            token = await authenticateTenant();
          } catch (error) {
            setIsLoading(false);
            return;
          }
        } else {
          // console.log("Token already exists");
        }

        if (token) {
          const firstMessage = "hi";
          try {
            const response = await startConversation(token, firstMessage);
            
            if (response && response.conversation_id) {
              // Use the raw message string which might be a JSON containing follow_ups
              const displayMessage = response.message.message;
              
              // Set the API response as the initial message
              setInitialMessage(displayMessage);
              localStorage.setItem("firstMessage", displayMessage);
              localStorage.setItem("conversationId", response.conversation_id);
            }
          } catch (error) {
            if (error.status === 401 && error.message === "Token expired") {
              localStorage.removeItem("authToken");
              localStorage.removeItem("conversationId");
              localStorage.removeItem("latestConversationId");
              setShowChatbot(false);
            }
          } finally {
            setIsLoading(false); // Stop loading
          }
        } else {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
  }, [showChatbot]);


  const toggleChatbot = () => {
    const isClosing = showChatbot;
    
    // 1. Toggle UI immediately
    setShowChatbot((prev) => !prev);

    // 2. If closing, cleanup in the background
    if (isClosing) {
      const token = localStorage.getItem("authToken");
      const conversationId =
        localStorage.getItem("conversationId") ||
        localStorage.getItem("latestConversationId");

      if (token && conversationId) {
        // Fire and forget, or handle errors silently
        endConversation(token, conversationId).catch((err) =>
          console.error("Background endConversation failed:", err.message)
        );

        localStorage.removeItem("conversationId");
        localStorage.removeItem("latestConversationId");
      }
    }
  };


  

  return (
    <div className="App">
      <div className="hero-section">
        <h1>Intelligent Assistant</h1>
        <p>Experience the next generation of conversational AI. Fast, intuitive, and always here to help.</p>
      </div>

      <div className={`chatbot-container ${showChatbot ? 'visible' : 'hidden'}`}>
        {showChatbot && (
          <Chatbot
            key={initialMessage + isLoading} // Force re-render when message or loading state changes
            config={config(initialMessage, isLoading)}
            messageParser={MessageParser}
            actionProvider={(props) => (
              <ActionProvider {...props} setShowChatbot={setShowChatbot} />
            )}
          />
        )}
      </div>

      <button className="chat-toggle-button" onClick={toggleChatbot} aria-label="Toggle Chatbot">
        {showChatbot ? (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
         </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 01-.978-2.023 1.29 1.29 0 01.185-.883c.229-.331.478-.652.746-.963C4.177 15.963 4 14.057 4 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default App;

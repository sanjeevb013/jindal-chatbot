import React from 'react';
import { createClientMessage } from '../lib/index';
import config from './config.jsx';

const ActionProvider = ({ createChatBotMessage, setState, children, state, setShowChatbot }) => {
  const handleHello = () => {
    const botMessage = createChatBotMessage('Hello. Nice to meet you.');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleGoodbye = () => {
    const botMessage = createChatBotMessage('Goodbye! It was nice chatting with you. Have a great day!');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleThanks = () => {
    const botMessage = createChatBotMessage("You're welcome! I'm happy to help. Is there anything else you need?");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleHelp = () => {
    const botMessage = createChatBotMessage(
      'I can assist you with various queries. Try asking me about our services, products, or general questions!'
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleProducts = () => {
    const botMessage = createChatBotMessage(
      'We offer a wide range of products including electronics, clothing, and home goods. What are you interested in?'
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleServices = () => {
    const botMessage = createChatBotMessage(
      'Our services include customer support, technical assistance, and consultation. How can I help you today?'
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleContact = () => {
    const botMessage = createChatBotMessage(
      'You can reach us at support@example.com or call us at 1-800-123-4567. We are available Monday through Friday, 9 AM to 5 PM.'
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handlePricing = () => {
    const botMessage = createChatBotMessage(
      'Our pricing varies depending on the product or service. Could you tell me what you are interested in so I can provide specific pricing information?'
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleUnknown = () => {
    const botMessage = createChatBotMessage(
      "I'm not sure I understand. Could you rephrase that or type 'help' to see what I can assist you with?"
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleJoke = () => {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    const botMessage = createChatBotMessage(randomJoke);

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const processMessage = async (message, showAsUser = false) => {
    if (showAsUser) {
      const userMessage = createClientMessage(message);
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      return;
    }

    // Add a temporary loading indicator
    const loadingId = `loading-${Date.now()}`;
    const loadingMessage = createChatBotMessage('...', { 
      isTyping: true,
      id: loadingId 
    });
    // Force the ID on the message object as createChatBotMessage might not use the one in options for internal tracking initially
    loadingMessage.id = loadingId;

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));

    // Correctly get the current conversation ID from the passed state
    let conversationId = state?.conversationId || null;
    if (!conversationId) {
      conversationId = localStorage.getItem("conversationId");

      // Use localStorage value ONLY ONCE
      if (conversationId) {
        localStorage.removeItem("conversationId");
      }
    }

    try {
      const { startConversation } = await import('../api');
      const response = await startConversation(token, message, conversationId);

      if (response && response.message) {
        // Update conversation ID in state
        if (response.conversation_id) {
          setState((prev) => ({
            ...prev,
            conversationId: response.conversation_id,
          }));
          localStorage.setItem("latestConversationId", response.conversation_id);
        }
        
        const messageContent = typeof response.message === 'object' && response.message !== null 
          ? response.message.message 
          : response.message;

        const botMessage = createChatBotMessage(messageContent, {
          payload: {
            ...response,
            followUp: (response.message && typeof response.message === 'object') 
              ? (response.message.follow_up || response.message.folow_up || response.follow_up)
              : response.follow_up
          }
        });

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages.filter(m => m.id !== loadingId), botMessage],
        }));
      } else {
        // Remove loader if response is invalid
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== loadingId),
        }));
      }
    } catch (error) {
      
      // Remove loading indicator on error
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== loadingId),
      }));

      if (error.status === 401 && error.message === "Token expired") {
        
        // 1. Delete chat history but keep initial messages
        setState((prev) => ({
          ...prev,
          messages: config.initialMessages || [],
          conversationId: null
        }));

        // 2. Clear tokens/IDs from localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("conversationId");
        localStorage.removeItem("latestConversationId");

        // 3. Close the chat UI
        if (typeof setShowChatbot === 'function') {
          setShowChatbot(false);
        }
        
        return;
      }

      const errorMessage = createChatBotMessage("I'm sorry, I'm having trouble connecting right now.");
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleHello,
            handleGoodbye,
            handleThanks,
            handleHelp,
            handleProducts,
            handleServices,
            handleContact,
            handlePricing,
            handleUnknown,
            handleJoke,
            processMessage,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;

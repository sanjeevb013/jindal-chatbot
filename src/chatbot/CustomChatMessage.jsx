import React from 'react';
import './CustomChatMessage.css';

const CustomChatMessage = (props) => {
  const { message, payload, actions, isTyping, customStyles } = props;

  // Apply custom background color if available
  const bubbleStyle = customStyles ? { backgroundColor: customStyles.backgroundColor } : {};

  if (isTyping || payload?.loading) {
    return (
      <div className="custom-chat-message-wrapper typing">
        <div className="react-chatbot-kit-chat-bot-message loader-bubble" style={bubbleStyle}>
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  let parsedMessageText = message;
  let followUpFromJSON = null;

  // ✅ Try parsing message if it's JSON string
  try {
    if (typeof message === "string" && message.trim().startsWith("{")) {
      const parsed = JSON.parse(message);
      parsedMessageText = parsed.message || message;
      followUpFromJSON = parsed.follow_up || parsed.folow_up;
    }
  } catch (err) {
    // console.warn("Message is not JSON, rendering as plain text");
  }

  const followUp = followUpFromJSON || payload?.message?.folow_up || payload?.message?.follow_up || payload?.followUp;

  // Ensure followUp is an array for mapping, or handle single string/invalid types
  const followUpItems = Array.isArray(followUp) 
    ? followUp 
    : (typeof followUp === 'string' && followUp.length > 0 ? [followUp] : []);

  const handleFollowUpClick = (text) => {
    if (actions && actions.processMessage) {
      actions.processMessage(text, true);
    }
  };

  const renderMessageContent = () => {
    if (Array.isArray(parsedMessageText)) {
      return (
        <div className="message-array-container">
          {parsedMessageText.map((item, index) => (
            <div key={index} className="message-list-item">
              {item.store_name && <div className="item-store-name">{item.store_name}</div>}
              <div className="item-details">
                {item.name && (
                  <div className="item-detail">
                    <span className="detail-label">👤 Name:</span> {item.name}
                  </div>
                )}
                {item.mobile && (
                  <div className="item-detail">
                    <span className="detail-label">📞 Mobile:</span> 
                    <a href={`tel:${item.mobile}`} className="detail-link">{item.mobile}</a>
                  </div>
                )}
                {item.email && (
                  <div className="item-detail">
                    <span className="detail-label">✉️ Email:</span> 
                    <a href={`mailto:${item.email}`} className="detail-link">{item.email}</a>
                  </div>
                )}
                {item.house_number && (
                  <div className="item-detail">
                    <span className="detail-label">📍 Address:</span> {item.house_number}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <span className="message-content">{parsedMessageText}</span>;
  };

  return (
    <div className="custom-chat-message-wrapper">
      <div className={`react-chatbot-kit-chat-bot-message ${Array.isArray(parsedMessageText) ? 'array-message' : ''}`} style={bubbleStyle}>
        {renderMessageContent()}
      </div>
      
      {followUpItems.length > 0 && (
        <div className="follow-up-container-below">
          <p className="follow-up-label-text">Suggested Questions:</p>
          <div className="follow-up-chip-list">
            {followUpItems.map((item, index) => (
              <div 
                key={index} 
                className="follow-up-chip-item"
                // onClick={() => handleFollowUpClick(item)}
              >
                <span className="follow-up-chip-icon">✨</span>
                <span className="follow-up-chip-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomChatMessage;

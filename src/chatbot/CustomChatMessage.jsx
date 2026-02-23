import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    
    // Render markdown if text contains markdown syntax, otherwise plain text
    return (
      <div className="message-content markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({node, ...props}) => <p style={{margin: '8px 0'}} {...props} />,
            ul: ({node, ...props}) => <ul style={{margin: '8px 0', paddingLeft: '20px'}} {...props} />,
            ol: ({node, ...props}) => <ol style={{margin: '8px 0', paddingLeft: '20px'}} {...props} />,
            li: ({node, ...props}) => <li style={{margin: '4px 0'}} {...props} />,
            code: ({node, inline, ...props}) => 
              inline ? 
                <code style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '3px'}} {...props} /> :
                <pre style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '4px', overflow: 'auto'}} {...props} />,
            a: ({node, ...props}) => <a style={{color: '#fff', textDecoration: 'underline'}} {...props} />,
            strong: ({node, ...props}) => <strong style={{fontWeight: 'bold'}} {...props} />,
            em: ({node, ...props}) => <em style={{fontStyle: 'italic'}} {...props} />,
            table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%', margin: '8px 0'}} {...props} />,
            th: ({node, ...props}) => <th style={{border: '1px solid rgba(0,0,0,0.2)', padding: '8px', textAlign: 'left', fontWeight: 'bold'}} {...props} />,
            td: ({node, ...props}) => <td style={{border: '1px solid rgba(0,0,0,0.2)', padding: '8px'}} {...props} />,
          }}
        >
          {parsedMessageText}
        </ReactMarkdown>
      </div>
    );
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

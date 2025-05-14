// Main React component for the AI ChatBot will go here
import React, { useState, useEffect, useRef } from 'react';
import { initializeChatAgent, AIMessage, HumanMessage } from './langchainConfig';
import { FaMinus, FaComments } from "react-icons/fa";
import './AIChatBot.css'; // We'll create this file for styling

const AIChatBot = () => {
  const [agentExecutor, setAgentExecutor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null); // For auto-scrolling

  // Load chat history from localStorage and initialize agent on mount
  useEffect(() => {
    const loadHistoryAndInitAgent = async () => {
      try {
        const storedHistory = localStorage.getItem('chatHistory');
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory).map(msg => {
            if (msg.type === 'human') return new HumanMessage(msg.content);
            if (msg.type === 'ai') return new AIMessage(msg.content);
            return msg; // Should not happen if stored correctly
          });
          setMessages(parsedHistory);
        }

        const executor = await initializeChatAgent();
        setAgentExecutor(executor);
      } catch (err) {
        console.error("Error initializing chat agent or loading history:", err);
        setError("Failed to initialize AI Chatbot. Please ensure API keys are set up correctly and try refreshing.");
      }
    };
    loadHistoryAndInitAgent();
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      const serializableHistory = messages.map(msg => ({
        type: msg instanceof HumanMessage ? 'human' : (msg instanceof AIMessage ? 'ai' : 'system'), // or other types
        content: msg.content
      }));
      localStorage.setItem('chatHistory', JSON.stringify(serializableHistory));
    }
  }, [messages]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !agentExecutor || isLoading) return;

    const userMessage = new HumanMessage(input);
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Extract just the message content for chat history to pass to the agent
      // The agentExecutor's memory will handle the full AIMessage/HumanMessage objects internally
      const currentChatHistory = messages.map(msg => {
        if (msg instanceof HumanMessage) return new HumanMessage(msg.content);
        if (msg instanceof AIMessage) return new AIMessage(msg.content);
        return msg;
      });

      const response = await agentExecutor.invoke({
        input: userMessage.content, // Send only the content string as input
        chat_history: currentChatHistory, // Pass existing history
      });
      
      const aiResponse = new AIMessage(response.output); // response.output contains the AI's textual response
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (err) {
      console.error("Error communicating with AI agent:", err);
      setError("Sorry, I encountered an error. Please try again.");
      // Optionally add the error as a message to the chat
      setMessages(prevMessages => [...prevMessages, new AIMessage("Error: Could not get a response.")]);
    } finally {
      setIsLoading(false);
    }
  };

  // Minimize/maximize handlers
  const handleMinimize = () => setMinimized(true);
  const handleMaximize = () => setMinimized(false);

  // Minimized state: show only the chat icon
  if (minimized) {
    return (
      <button
        className="ai-chatbot-minimized-btn"
        onClick={handleMaximize}
        aria-label="Open chat"
      >
        <FaComments size={28} />
      </button>
    );
  }

  return (
    <div className="ai-chatbot-container">
      <div className="ai-chatbot-header">
        <span>Atlas Chat</span>
        <button className="minimize-btn" onClick={handleMinimize} aria-label="Minimize chat">
          <FaMinus />
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg instanceof HumanMessage ? 'user-message' : 'ai-message'}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && <div className="message ai-message"><p>Thinking...</p></div>}
        {error && <div className="message error-message"><p>{error}</p></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about recipes or meats..."
          disabled={!agentExecutor || isLoading}
        />
        <button type="submit" disabled={!agentExecutor || isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChatBot; 
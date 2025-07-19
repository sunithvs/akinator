'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './chat-message';
import { GuessModal } from './guess-modal';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  content: string;
  sender_type: 'user' | 'ai';
  timestamp: string;
}

interface AssignedUser {
  id: string;
  display_name: string;
  description: string;
}

interface ChatInterfaceProps {
  assigned_user: AssignedUser;
  onCorrectGuess: () => void;
}

export function ChatInterface({ assigned_user, onCorrectGuess }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [isGuessing, setIsGuessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          content: "Hi there! I'm ready to chat. Ask me anything you'd like to know about me!",
          sender_type: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      content: inputMessage,
      sender_type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          assigned_user_id: assigned_user.id,
          conversation_history: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        content: data.response,
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if this was a correct guess
      if (data.correct_guess) {
        setTimeout(() => {
          onCorrectGuess();
        }, 2000); // Wait 2 seconds to let user see the success message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMakeGuess = () => {
    setShowGuessModal(true);
  };

  const handleSubmitGuess = async (guess: string) => {
    setIsGuessing(true);
    
    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: guess,
          assigned_user_id: assigned_user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit guess');
      }

      const data = await response.json();
      
      // Add the guess result as a system message
      const resultMessage: ChatMessage = {
        content: data.message,
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, resultMessage]);
      setShowGuessModal(false);

      // If correct, trigger the callback to get a new user
      if (data.correct) {
        setTimeout(() => {
          onCorrectGuess();
        }, 2000); // Wait 2 seconds to let user see the success message
      }

    } catch (error) {
      console.error('Error submitting guess:', error);
      const errorMessage: ChatMessage = {
        content: "Sorry, there was an error processing your guess. Please try again.",
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowGuessModal(false);
    } finally {
      setIsGuessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px]">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          <div>
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-1">🗨️ Detective Chat</h2>
            <p className="text-gray-600 text-sm md:text-base">Ask clever questions to discover your target&apos;s identity!</p>
          </div>
          <Button 
            onClick={handleMakeGuess} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium shadow-lg transform hover:scale-105 transition-all duration-200 w-full md:w-auto"
          >
            🎯 Make Guess
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center mt-8 md:mt-16">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-gray-200 max-w-sm md:max-w-md mx-auto">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">💭</div>
              <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Ready to Begin?</h4>
              <p className="text-gray-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                Start asking questions to learn about your mystery person. Try asking about their hobbies, 
                favorite things, or background!
              </p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-500">
                <p>💡 <em>&quot;What&apos;s your favorite hobby?&quot;</em></p>
                                  <p>💡 <em>&quot;Where did you study?&quot;</em></p>
                  <p>💡 <em>&quot;What kind of movies do you like?&quot;</em></p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              sender_type={message.sender_type}
              timestamp={message.timestamp}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 max-w-xs">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 font-medium text-sm md:text-base">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question to learn more..."
            className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium shadow-md transform hover:scale-105 transition-all duration-200 text-sm md:text-base"
          >
            {isLoading ? '⏳' : '📤'} Send
          </Button>
        </div>
      </div>

      {/* Guess Modal */}
      <GuessModal
        isOpen={showGuessModal}
        onClose={() => setShowGuessModal(false)}
        onSubmitGuess={handleSubmitGuess}
        isLoading={isGuessing}
      />
    </div>
  );
}
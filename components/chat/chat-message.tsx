interface ChatMessageProps {
  content: string;
  sender_type: 'user' | 'ai';
  timestamp: string;
}

export function ChatMessage({ content, sender_type, timestamp }: ChatMessageProps) {
  const isUser = sender_type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 md:mb-4`}>
      <div className={`flex items-start space-x-2 md:space-x-3 max-w-xs md:max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-indigo-500 text-white'
        }`}>
          {isUser ? '👤' : '🤖'}
        </div>
        
        {/* Message bubble */}
        <div
          className={`px-3 md:px-5 py-2 md:py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
          }`}
        >
          <p className="text-sm md:text-base leading-relaxed">{content}</p>
          <p className={`text-xs mt-1 md:mt-2 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {isUser ? 'You' : 'Mystery Person'} • {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
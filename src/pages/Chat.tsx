import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { chatAPI } from '../lib/api';
import { ChatMessage } from '../types';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        user_id: 'demo',
        message: "Hello! I'm your AI fitness coach. How can I help you reach your goals today?",
        is_ai: true,
        created_at: new Date().toISOString(),
      },
    ];
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const aiResponses = [
    "That's a great question! Based on your current progress, I recommend increasing your protein intake and focusing on compound movements.",
    "I've analyzed your workout patterns. You're doing amazing! Consider adding a recovery day to optimize your gains.",
    "Let me create a personalized workout plan for you. I'll focus on your goals and adjust based on your progress.",
    "Your consistency is impressive! To break through your plateau, let's try progressive overload techniques.",
    "I recommend starting with 3-4 sessions per week, focusing on full-body workouts with proper rest days.",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: 'user',
      message: input,
      is_ai: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(input);
      if (response.messages && response.messages.length > 0) {
        const newMessages = response.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          user_id: msg.user_id || 'user',
          message: msg.message,
          is_ai: msg.is_ai,
          created_at: msg.created_at || new Date().toISOString(),
        }));
        setMessages((prev) => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        is_ai: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Create a workout plan',
    'Nutrition advice',
    'Track my progress',
    'Recovery tips',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
          AI Fitness Coach
        </h1>
        <p className="text-gray-400">Your personal AI trainer, available 24/7</p>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${message.is_ai ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${message.is_ai
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50'
                    : 'bg-white/10 border border-amber-500/30'
                  }
                `}
              >
                {message.is_ai ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div
                className={`
                  max-w-[70%] p-4 rounded-2xl backdrop-blur-sm
                  ${message.is_ai
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border border-amber-500/20'
                    : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                  }
                `}
              >
                <p className="text-gray-100 text-sm leading-relaxed">{message.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(message.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-amber-500/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-amber-500/20">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 hover:border-amber-500/40 text-gray-300 text-sm hover:text-white transition-all duration-300 hover:scale-105"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
              className="w-full px-6 py-4 pr-14 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 flex items-center justify-center shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-gray-300 text-sm">
                Powered by advanced AI - Personalized coaching based on your data
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
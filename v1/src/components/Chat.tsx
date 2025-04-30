import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Paperclip,
  Send,
  Plus,
  Brain,
  Menu,
  X,
  Download,
  Copy,
  FileText,
  User,
  LogOut,
} from 'lucide-react';
import { getAIResponse } from '../lib/azure-openai';
import { formatMessage } from '../lib/markdown';
import { exportToMarkdown, copyToClipboard, exportToPDF } from '../lib/export';
import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../types';

export function Chat({ onProfileClick }: { onProfileClick: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserProfile();
    // Close sidebar by default on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile({
        email: user.email,
        ...profile,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { type: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Close sidebar on mobile after sending message
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      const aiResponse = await getAIResponse([...messages, userMessage]);
      setMessages((prev) => [
        ...prev,
        { type: 'assistant', content: aiResponse },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content:
            "I apologize, but I'm having trouble processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (index: number, type: 'markdown' | 'copy' | 'pdf') => {
    const message = messages[index];
    if (!message || message.type !== 'assistant') return;

    switch (type) {
      case 'markdown':
        exportToMarkdown([messages[index - 1], message]);
        break;
      case 'copy':
        copyToClipboard([messages[index - 1], message]);
        break;
      case 'pdf':
        const element = messageRefs.current[index];
        if (element) exportToPDF(element);
        break;
    }
  };

  const suggestedQuestions = [
    {
      title: '💰 Budget Analysis',
      desc: 'Get insights about your spending patterns',
      query: 'Can you analyze my monthly budget and suggest improvements?',
    },
    {
      title: '🎯 Set Financial Goals',
      desc: 'Create and track your savings goals',
      query: 'Help me set up a savings goal for buying a house',
    },
    {
      title: '📊 Investment Tips',
      desc: 'Learn about investment strategies',
      query: 'What are some safe investment strategies for beginners?',
    },
    {
      title: '💡 Financial Education',
      desc: 'Learn about personal finance basics',
      query: 'Explain the basics of personal finance and budgeting',
    },
  ];

  return (
    <div className="flex h-screen bg-[#1A1D1E] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#141718] z-40 flex items-center justify-between px-4 border-b border-gray-800">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? (
            <X size={24} className="text-gray-400" />
          ) : (
            <Menu size={24} className="text-gray-400" />
          )}
        </button>
        <div className="text-gray-300 text-lg font-semibold">Financial AI</div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-[280px] bg-[#141718] transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 flex flex-col
          ${window.innerWidth < 768 ? 'mt-16' : ''}
        `}
      >
        <div className="hidden md:block p-4 text-gray-300 text-xl font-semibold">
          Fincy Financial AI
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <button
            className="w-full flex items-center gap-2 bg-[#4B57FF] text-white rounded-lg p-3 mb-6 hover:bg-[#3A45FF] transition-all duration-300 hover:shadow-lg"
            onClick={() => {
              setMessages([]);
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
          >
            <Plus size={20} />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Profile Section */}
        {userProfile && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                onProfileClick();
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className="flex items-center gap-3 w-full hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#4B57FF] flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white truncate">{userProfile.email}</p>
                <p className="text-gray-400 text-sm">
                  {userProfile.monthly_income
                    ? `₹${userProfile.monthly_income}/month`
                    : 'No income set'}
                </p>
              </div>
            </button>
            <button
              onClick={handleSignOut}
              className="mt-2 w-full p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen md:h-auto overflow-hidden">
        <div
          ref={chatContainerRef}
          className={`
            flex-1 overflow-y-auto 
            ${window.innerWidth < 768 ? 'mt-16' : ''}
            ${
              messages.length === 0 ? 'flex items-center justify-center' : 'p-4'
            }
          `}
        >
          {messages.length === 0 ? (
            <div className="max-w-3xl w-full p-4 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[#4B57FF] rounded-full animate-pulse mb-6">
                  <Brain size={32} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Fincy AI Assistant
                </h1>
                <p className="text-lg md:text-xl text-gray-300">
                  How can I help you with your finances today?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q.query);
                      handleSend(new Event('submit') as any);
                    }}
                    className="p-4 bg-[#1F2223] rounded-lg hover:bg-[#252829] text-white text-left transition-all duration-300 hover:scale-[1.02]"
                  >
                    <h3 className="font-semibold mb-2">{q.title}</h3>
                    <p className="text-sm text-gray-300">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl w-full mx-auto space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      ref={(el) => (messageRefs.current[index] = el)}
                      className={`
                        max-w-[85%] sm:max-w-[80%] rounded-lg p-4 
                        ${
                          message.type === 'user'
                            ? 'bg-[#4B57FF] text-white'
                            : 'bg-[#1F2223] text-white'
                        }
                      `}
                    >
                      {formatMessage(message.content)}
                    </div>
                  </div>
                  {/* Export options for AI responses */}
                  {message.type === 'assistant' && (
                    <div className="flex flex-wrap justify-start gap-2 mt-2 ml-4">
                      <button
                        onClick={() => handleExport(index, 'markdown')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:bg-[#252829] rounded-md transition-all duration-300"
                      >
                        <Download size={14} />
                        Export .md
                      </button>
                      <button
                        onClick={() => handleExport(index, 'copy')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:bg-[#252829] rounded-md transition-all duration-300"
                      >
                        <Copy size={14} />
                        Copy Text
                      </button>
                      <button
                        onClick={() => handleExport(index, 'pdf')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:bg-[#252829] rounded-md transition-all duration-300"
                      >
                        <FileText size={14} />
                        Save PDF
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1F2223] text-white rounded-lg p-4 flex items-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Processing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#1F2223]">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-[#1F2223] rounded-lg p-2">
              <button
                type="button"
                className="p-2 hover:bg-[#252829] rounded-lg transition-all duration-300"
              >
                <Paperclip size={20} className="text-gray-400" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 bg-transparent border-none focus:outline-none text-white min-w-0"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 hover:bg-[#252829] rounded-lg transition-all duration-300"
                disabled={isLoading}
              >
                <Send
                  size={20}
                  className={`${
                    isLoading ? 'text-gray-500' : 'text-[#4B57FF]'
                  }`}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

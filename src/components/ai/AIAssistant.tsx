import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIAssistantProps {
  // Receives a full prompt string (already including context)
  onApiCall?: (prompt: string) => Promise<string>;
}

interface Conversation {
  id: string;
  createdAt: number; // epoch ms
  title: string;
  messages: Message[];
}

const STORAGE_KEY_SINGLE = 'ai_assistant_conversation_v1'; // legacy key (for migration)
const CONVERSATIONS_KEY = 'ai_assistant_conversations_v1';
const EXPIRY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

const AIAssistant = ({ onApiCall }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations (with migration from single key)
  useEffect(() => {
    try {
      const now = Date.now();
      let stored: Conversation[] = [];
      const multiRaw = localStorage.getItem(CONVERSATIONS_KEY);
      if (multiRaw) {
        stored = JSON.parse(multiRaw).filter((c: Conversation) => now - c.createdAt < EXPIRY_MS);
      } else {
        // migrate legacy single conversation if exists
        const legacyRaw = localStorage.getItem(STORAGE_KEY_SINGLE);
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw);
            if (legacy?.createdAt && legacy?.messages) {
              if (now - legacy.createdAt < EXPIRY_MS) {
                stored = [{
                  id: 'conv-legacy',
                  createdAt: legacy.createdAt,
                  title: 'Percakapan Lama',
                  messages: legacy.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                }];
              } else {
                localStorage.removeItem(STORAGE_KEY_SINGLE);
              }
            }
        }
      }

      if (!stored.length) {
        const welcomeMessage: Message = {
          id: 'welcome',
          text: 'Halo! Saya AI Assistant Pangan Jawara. Saya siap membantu Anda dengan pertanyaan seputar ketahanan pangan, pertanian, dan informasi lainnya. Ada yang bisa saya bantu?',
          sender: 'ai',
          timestamp: new Date()
        };
        const newConv: Conversation = {
          id: 'conv-' + Date.now(),
          createdAt: now,
          title: 'Percakapan Baru',
          messages: [welcomeMessage]
        };
        stored = [newConv];
      } else {
        // ensure Date objects
        stored = stored.map(c => ({
          ...c,
          messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      }
      setConversations(stored);
      setActiveConversationId(stored[0].id);
      setMessages(stored[0].messages);
      // persist after cleaning
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(stored));
    } catch (e) {
      console.warn('Failed loading conversations', e);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (!conversations.length) return;
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      // ignore
    }
  }, [conversations]);

  const updateActiveConversationMessages = (nextMessages: Message[]) => {
    setMessages(nextMessages);
    setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, messages: nextMessages } : conv));
  };

  const createNewConversation = () => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      text: 'Halo! Ada yang ingin Anda tanyakan? 😊',
      sender: 'ai',
      timestamp: new Date()
    };
    const conv: Conversation = {
      id: 'conv-' + Date.now(),
      createdAt: Date.now(),
      title: 'Percakapan Baru',
      messages: [welcomeMessage]
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages(conv.messages);
  };

  const renameConversationIfNeeded = (convId: string, firstUserText: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === convId && (c.title === 'Percakapan Baru' || c.title === 'Percakapan Lama')) {
        return { ...c, title: firstUserText.slice(0, 40) + (firstUserText.length > 40 ? '…' : '') };
      }
      return c;
    }));
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const buildContextPrompt = (allMessages: Message[], currentUserMessage: string) => {
    // Take last 20 messages to limit size
    const recent = allMessages.slice(-20);
    const history = recent
      .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text.replace(/\n+/g, '\n')}`)
      .join('\n');
    return `${history}\nUser: ${currentUserMessage}\nAI:`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

  updateActiveConversationMessages([...messages, userMessage]);
  if (activeConversationId) renameConversationIfNeeded(activeConversationId, inputMessage);
    setInputMessage("");
    setIsLoading(true);

    try {
      let aiResponse = "";
      const contextPrompt = buildContextPrompt([...messages, userMessage], inputMessage);
      if (onApiCall) {
        aiResponse = await onApiCall(contextPrompt);
      } else {
        aiResponse = getDefaultResponse(inputMessage);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

  updateActiveConversationMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Maaf, terjadi kesalahan. Silakan coba lagi nanti.",
        sender: "ai",
        timestamp: new Date(),
      };
  updateActiveConversationMessages([...messages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("pangan") || lowerMessage.includes("makanan")) {
      return "Ketahanan pangan adalah kondisi terpenuhinya pangan bagi negara sampai dengan perseorangan. Di Indonesia, kita menghadapi berbagai tantangan seperti perubahan iklim dan pertumbuhan populasi. Ada yang spesifik ingin Anda ketahui?";
    }
    
    if (lowerMessage.includes("pertanian") || lowerMessage.includes("petani")) {
      return "Sektor pertanian sangat vital bagi Indonesia. Platform Pangan Jawara menyediakan data real-time, edukasi modern, dan komunitas untuk mendukung petani. Apakah Anda seorang petani atau tertarik belajar tentang pertanian?";
    }
    
    if (lowerMessage.includes("teknologi") || lowerMessage.includes("digital")) {
      return "Teknologi digital dalam pertanian meliputi IoT sensors, drone monitoring, AI untuk prediksi cuaca, dan sistem manajemen data. Kami mengintegrasikan teknologi ini untuk membantu petani membuat keputusan yang lebih baik.";
    }
    
    if (lowerMessage.includes("harga") || lowerMessage.includes("pasar")) {
      return "Informasi harga komoditas pangan dapat Anda lihat di halaman Data & Analytics. Kami menyediakan data real-time dari berbagai pasar tradisional dan modern di seluruh Indonesia.";
    }
    
    if (lowerMessage.includes("cuaca") || lowerMessage.includes("iklim")) {
      return "Perubahan iklim sangat mempengaruhi produksi pangan. Platform kami menyediakan prediksi cuaca dan rekomendasi untuk adaptasi pertanian. Ingin tahu lebih lanjut tentang mitigasi risiko iklim?";
    }

    if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
      return "Halo! Senang bertemu dengan Anda. Saya di sini untuk membantu menjawab pertanyaan seputar ketahanan pangan, pertanian, teknologi, atau hal lain yang ingin Anda ketahui. Silakan bertanya!";
    }
    
    return "Terima kasih atas pertanyaannya! Saya akan terus belajar untuk memberikan jawaban yang lebih baik. Sementara itu, Anda dapat menjelajahi fitur Data & Analytics, Edukasi, atau Komunitas untuk informasi lebih lengkap. Ada hal lain yang bisa saya bantu?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Basic lightweight markdown-style formatting: **bold**, bullet lists (* / -), paragraphs
  const formatMessage = (text: string) => {
    const lines = text.split(/\r?\n/);
    const elements: JSX.Element[] = [];
    let listBuffer: string[] = [];
    const flushList = () => {
      if (listBuffer.length) {
        elements.push(
          <ul key={elements.length + '-list'} className="list-disc pl-5 space-y-1 mt-1 mb-2">
            {listBuffer.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    const renderInline = (line: string) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
      return parts.map((part, idx) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={idx}>{part}</span>;
      });
    };

    const renderInlineRef = renderInline; // to satisfy TS for usage inside map before declaration order

    lines.forEach((raw, i) => {
      const line = raw.trimEnd();
      if (/^\s*[\*-]\s+/.test(line)) {
        // bullet line
        const content = line.replace(/^\s*[\*-]\s+/, "");
        listBuffer.push(content);
      } else if (line.trim() === "") {
        flushList();
        // blank line becomes spacing
        elements.push(<div key={elements.length + '-br'} className="h-2" />);
      } else {
        flushList();
        elements.push(
          <p key={elements.length + '-p'} className="mb-2 last:mb-0">
            {renderInlineRef(line)}
          </p>
        );
      }
    });
    flushList();
    return <>{elements}</>;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpen(true)}
          className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/25 hover:scale-110 transition-all animate-pulse hover:animate-none"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Tanya AI Assistant
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="fixed z-[60] bottom-0 left-0 right-0 px-2 pb-2 sm:bottom-6 sm:right-6 sm:left-auto sm:px-0 sm:pb-0">
      <div
        className={`bg-white shadow-2xl border border-gray-200 flex flex-col transition-all overflow-hidden ${
          isMinimized
            ? "rounded-full w-64 sm:w-72 h-14 mx-auto sm:mx-0"
            : "rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-w-md mx-auto sm:mx-0 h-[calc(100dvh-5.5rem)] sm:h-[600px] max-h-[calc(100dvh-5.5rem)]"
        }`}
        style={{
          WebkitOverflowScrolling: 'touch'
        }}
      >
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-2 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-green-100">Pangan Jawara</p>
              </div>
            </div>
            
            {/* Mobile controls */}
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Desktop and conversation controls */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {!isMinimized && (
              <div className="flex items-center space-x-2 flex-1 sm:flex-none max-w-[200px] sm:max-w-none">
                <select
                  value={activeConversationId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    setActiveConversationId(id);
                    const conv = conversations.find(c => c.id === id);
                    if (conv) setMessages(conv.messages);
                  }}
                  className="text-xs bg-white/20 border border-white/30 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/50 backdrop-blur-sm flex-1 sm:flex-none min-w-0 max-w-[160px] sm:max-w-[180px] truncate"
                >
                  {conversations.map(c => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title}
                    </option>
                  ))}
                </select>
                <button
                    onClick={createNewConversation}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    title="Chat Baru"
                >
                    <MessageCircle size={16} />
                </button>
              </div>
            )}
            
            {/* Desktop controls */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300/70 hover:scrollbar-thumb-gray-400">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {message.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div
                      className={`px-3 py-2 rounded-2xl overflow-hidden ${
                        message.sender === "user"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      <div className="text-sm leading-relaxed">
                        {formatMessage(message.text)}
                      </div>
                      <div
                        className={`text-[10px] mt-1 tracking-wide ${
                          message.sender === "user" ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-gray-600" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-end space-x-2">
                <textarea
                  ref={inputRef as any}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pertanyaan Anda..."
                  rows={1}
                  className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm leading-relaxed max-h-40 overflow-y-auto"
                  disabled={isLoading}
                  style={{ minHeight: '42px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                  title="Kirim"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;

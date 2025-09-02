import { useState } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{
    text: string;
    isBot: boolean;
    timestamp: Date;
  }>>([
    {
      text: "Halo! Saya asisten virtual Platform Ketahanan Pangan. Ada yang bisa saya bantu?",
      isBot: true,
      timestamp: new Date()
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      text: message,
      isBot: false,
      timestamp: new Date()
    }]);
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Terima kasih atas pertanyaan Anda. Saya sedang memproses informasi yang Anda butuhkan.",
        isBot: true,
        timestamp: new Date()
      }]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-full shadow-elegant",
          "bg-gradient-primary text-primary-foreground",
          "flex items-center justify-center",
          "hover:scale-110 transition-transform duration-300",
          isOpen && "hidden"
        )}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-6 right-6 z-40",
        "w-96 h-[500px] bg-card rounded-xl shadow-elegant",
        "border border-border flex flex-col",
        "transition-all duration-300",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="bg-gradient-primary text-primary-foreground p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs opacity-90">Online • Siap membantu</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                msg.isBot ? "justify-start" : "justify-end"
              )}
            >
              <div className={cn(
                "max-w-[80%] p-3 rounded-lg",
                msg.isBot 
                  ? "bg-muted text-foreground" 
                  : "bg-gradient-primary text-primary-foreground"
              )}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan Anda..."
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatAssistant;
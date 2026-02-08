
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/ai';
import { useCars } from '../context/CarContext';
import { useSiteConfig } from '../context/SiteConfigContext';

const AIChatAssistant: React.FC = () => {
  const { config } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Welcome to ${config.siteName}. I am your concierge. How can I assist with your luxury automotive search today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { cars } = useCars();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const inventorySummary = cars.length > 0 
        ? cars.slice(0, 15).map(c => `${c.make} ${c.model} (${c.year}) for $${c.price}`).join(', ')
        : "Currently updating our private collection...";
        
      const aiResponse = await aiService.getCarAdvice(userMsg, inventorySummary, config.siteName);
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse || 'Our concierge service is currently undergoing maintenance.' }]);
    } catch (error) {
      console.error("Chat Error (Caught in Component):", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'I encountered a technical synchronization error. Please try again in a moment.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="glass w-[350px] h-[500px] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-widest uppercase">Concierge</h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-zinc-500 uppercase">Live</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-500 p-3 rounded-2xl text-[10px] italic">
                  Concierge is analyzing...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-grow bg-zinc-900 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend} 
              disabled={isTyping}
              className="bg-white text-black p-2 rounded-full hover:bg-zinc-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};

export default AIChatAssistant;

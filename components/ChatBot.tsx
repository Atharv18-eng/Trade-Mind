import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Icons } from './ui/Icons';
import ReactMarkdown from 'react-markdown';

// Add type definitions for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your financial assistant. Ask me anything about trading strategies, terminology, or specific assets.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(null, transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const playResponse = async (text: string) => {
    const base64Audio = await generateSpeech(text);
    if (base64Audio) {
      const audioUrl = `data:audio/pcm;base64,${base64Audio}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
      }
    }
  };

  const handleSend = async (e: React.FormEvent | null, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, messageText);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText || "I couldn't generate a response.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);

      if (isHandsFree && responseText) {
        await playResponse(responseText);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: "Sorry, I encountered an error connecting to the server.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Icons.MessageSquare className="text-emerald-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Financial Advisor Chat</h3>
            <p className="text-xs text-slate-400">Powered by Gemini 3.1 Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHandsFree(!isHandsFree)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isHandsFree 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <Icons.Zap className={`w-3 h-3 ${isHandsFree ? 'animate-pulse' : ''}`} />
            {isHandsFree ? 'Hands-Free ON' : 'Hands-Free OFF'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              <div className="prose prose-invert prose-sm">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-xl rounded-bl-none p-4 flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-lg transition-all ${
            isListening 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
          title="Voice Command"
        >
          <Icons.Zap className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask about market trends, strategies..."}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
        />
        
        <button 
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Icons.Zap />
        </button>
      </form>
    </div>
  );
};

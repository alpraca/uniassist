import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EssayChatProps {
  userProfile: {
    goals: string;
    experience: string;
    achievements: string;
    extracurricular: string;
    socialLinks: Record<string, string>;
  };
  university: {
    name: string;
    id: string;
    strengths?: string[];
    programSpecificInfo?: Record<string, { description: string }>;
  };
  topic: {
    title: string;
    prompt: string;
    wordLimit: number;
  };
  onEssayGenerated: (essay: string) => void;
}

const EssayChat: React.FC<EssayChatProps> = ({ userProfile, university, topic, onEssayGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentEssay, setCurrentEssay] = useState<string>('');

  useEffect(() => {
    // Add initial AI message
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm your AI essay writing assistant. I'll help you create a compelling essay for ${university.name} about "${topic.title}". I can see your profile information and will incorporate your experiences and achievements. Would you like me to:

1. Generate a complete essay draft
2. Start with an outline
3. Discuss specific aspects of your profile to highlight
4. Focus on a particular experience or achievement

What would you prefer?`,
        timestamp: new Date()
      }
    ]);
  }, [university.name, topic.title]);

  useEffect(() => {
    // Scroll to bottom when messages update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    try {
      const response = await fetch('/api/chat-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          topic,
          university,
          profile: userProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Get AI response
    const aiResponse = await generateResponse(userMessage);

    // Check if response contains an essay
    const essayMatch = aiResponse.match(/===ESSAY_START===([\s\S]*?)===ESSAY_END===/);
    if (essayMatch) {
      const essayText = essayMatch[1].trim();
      setCurrentEssay(essayText);
      onEssayGenerated(essayText);
    }

    // Add AI response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: aiResponse.replace(/===ESSAY_START===[\s\S]*?===ESSAY_END===/, '').trim(),
      timestamp: new Date()
    }]);

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default EssayChat; 
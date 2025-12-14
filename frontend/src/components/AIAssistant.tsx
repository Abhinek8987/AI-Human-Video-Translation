import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
  isHelpful?: boolean;
};

type ChatContext = {
  lastTopic?: string;
  userName?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  conversationHistory: string[];
  lastAction?: string;
};

const quickReplies = [
  'How to upload a video?',
  'Check translation status',
  'Update payment method',
  'Account settings help'
];

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [context, setContext] = useState<ChatContext>({ 
    conversationHistory: [],
    sentiment: 'neutral',
    lastTopic: undefined,
    userName: undefined,
    lastAction: undefined
  });
  
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        // Auto-submit after voice input
        setTimeout(() => {
          handleSubmit(new Event('submit') as any);
        }, 500);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onspeechend = () => {
        setIsListening(false);
      };
    }
    
    // Initial bot message
    if (isOpen && chatMessages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! I'm your AI Assistant. How can I help you today? Here are some things I can help with:\n\n• Video uploads\n• Translation status\n• Account settings\n• Billing questions\n• Technical issues",
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['How to upload?', 'Translation status?', 'Account help', 'Billing questions']
      };
      setChatMessages([initialMessage]);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);
  
  // Toggle voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        playSound('start');
      } catch (e) {
        console.error('Error starting voice recognition:', e);
      }
    }
  };
  
  // Play sound effect
  const playSound = (type: 'send' | 'receive' | 'start' | 'end') => {
    const sounds = {
      send: 'https://assets.mixkit.co/active_storage/sfx/2709/2709-preview.mp3',
      receive: 'https://assets.mixkit.co/active_storage/sfx/2709/2709-preview.mp3',
      start: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3',
      end: 'https://assets.mixkit.co/active_storage/sfx/2406/2406-preview.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(e => console.error('Error playing sound:', e));
  };

  // Detect sentiment from text
  const detectSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const positiveWords = ['great', 'awesome', 'thanks', 'thank', 'helpful', 'good', 'love', 'amazing', 'perfect', 'excellent'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'upset', 'disappointed', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });
    
    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  };

  // Generate bot response
  const generateBotResponse = useCallback((userMessage: string, context: ChatContext) => {
    const lowerMessage = userMessage.toLowerCase();
    const sentiment = detectSentiment(userMessage);
    
    // Update context
    const newContext = {
      ...context,
      sentiment,
      lastMessage: userMessage,
      conversationHistory: [...context.conversationHistory, userMessage]
    };
    
    // Check for name in message
    const nameMatch = userMessage.match(/my name is (\w+)/i) || 
                     userMessage.match(/i am (\w+)/i) ||
                     userMessage.match(/call me (\w+)/i);
    
    if (nameMatch && !newContext.userName) {
      const name = nameMatch[1];
      newContext.userName = name;
      setContext(newContext);
      return {
        text: `Nice to meet you, ${name}! How can I assist you today?`,
        quickReplies: ['How to upload videos?', 'Check translation status', 'Account help']
      };
    }
    
    // Check for gratitude
    if (['thank', 'thanks', 'appreciate'].some(word => lowerMessage.includes(word))) {
      return {
        text: "You're welcome! Is there anything else I can help you with? 😊",
        quickReplies: ['Yes, please', 'No, that\'s all']
      };
    }
    
    // Check for explicit navigation requests
    const navigationIntent = userMessage.match(/(go to|navigate to|open|show me) (upload|dashboard|billing|settings|help)/i);
    if (navigationIntent) {
      const page = navigationIntent[2].toLowerCase();
      const pageNames: {[key: string]: string} = {
        'upload': 'Upload',
        'dashboard': 'Dashboard',
        'billing': 'Billing',
        'settings': 'Settings',
        'help': 'Help Center'
      };
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate(`/${page}`);
      }, 500);
      
      return {
        text: `Taking you to the ${pageNames[page]} page now. What would you like to do there?`,
        quickReplies: page === 'upload' 
          ? ['Upload new video', 'Check requirements', 'Supported formats'] 
          : page === 'dashboard'
          ? ['View recent jobs', 'Check status', 'Download videos']
          : ['View plan', 'Update payment', 'Get help']
      };
    }
    
    // FAQ keyword matching
    const faqKeywords: {[key: string]: {answer: string, quickReplies: string[]}} = {};
    const faqItems = [
      { question: 'How do I upload a video?', answer: 'Go to the Upload page and select your video file. Supported formats: MP4, MOV, AVI (max 2GB).' },
      { question: 'How long does translation take?', answer: 'Approximately 1 minute per minute of video plus 2-3 minutes processing time.' },
      { question: 'What languages are supported?', answer: 'Over 50 languages including English, Spanish, French, German, Chinese, Japanese, and more.' },
      { question: 'How do I download my video?', answer: 'Go to the Dashboard and click the download button next to your completed translation.' },
      { question: 'How do I update my payment method?', answer: 'Go to Billing > Payment Methods in your account settings to update your payment information.' }
    ];
    
    faqItems.forEach((item) => {
      // Use the first few words of the question as a key
      const key = item.question.toLowerCase().split(' ').slice(0, 3).join(' ');
      faqKeywords[key] = {
        answer: item.answer,
        quickReplies: ['More details', 'Related topics', 'Contact support']
      };
    });
    
    for (const [keyword, faq] of Object.entries(faqKeywords)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return {
          text: faq.answer,
          quickReplies: faq.quickReplies
        };
      }
    }
    
    // Context-aware responses
    if (newContext.lastTopic) {
      if (newContext.lastTopic === 'upload' && lowerMessage.includes('format')) {
        return {
          text: 'We support MP4, MOV, and AVI formats. For best results, use MP4 with H.264 codec. Maximum file size is 2GB.',
          quickReplies: ['How to compress video?', 'Other requirements', 'Start upload']
        };
      }
    }
    
    // Sentiment-based responses
    if (sentiment === 'negative') {
      return {
        text: "I'm sorry to hear you're having trouble. Let me help you resolve this issue. Could you provide more details?",
        quickReplies: ['It\'s about uploads', 'Translation issue', 'Account problem']
      };
    }
    
    // Actionable responses based on user intent
    const actionResponses = {
      upload: [
        "To upload a video, you can go to the Upload page and drag & drop your file. What type of video are you looking to upload?",
        "For video uploads, we support MP4, MOV, and AVI formats up to 2GB. Would you like me to show you how to compress your video?",
        "I can help with your upload! What language would you like to translate your video to?"
      ],
      status: [
        "To check your translation status, I can take you to the Dashboard where you'll see all your recent uploads and their statuses. Would you like me to show you?",
        "Your video translations typically take about the same length as the video itself. I can check the current status if you'd like.",
        "Looking up your recent translations now. Could you tell me the name of the video you're checking on?"
      ],
      account: [
        "I can help with account settings! What would you like to update? Your profile, notification preferences, or security settings?",
        "For account-related questions, I can guide you through updating your profile, changing your password, or managing your subscription. What do you need help with?",
        "Account settings can be customized to fit your needs. Would you like to update your personal information, notification preferences, or security settings?"
      ],
      billing: [
        "I can assist with billing questions! Would you like to view your current plan, update payment method, or check your invoice history?",
        "For billing inquiries, I can show you your subscription details, help you update payment information, or explain charges. What would you like to know?",
        "I'm happy to help with billing! You can view your plan details, update payment methods, or download invoices. Which would you like to do?"
      ]
    };
    
    // Detect intent from message
    const detectIntent = () => {
      if (/(upload|add|new video|import)/i.test(lowerMessage)) return 'upload';
      if (/(status|progress|where is|when will|done)/i.test(lowerMessage)) return 'status';
      if (/(account|profile|settings|preferences)/i.test(lowerMessage)) return 'account';
      if (/(bill|payment|invoice|subscription|plan)/i.test(lowerMessage)) return 'billing';
      return 'general';
    };
    
    const intent = detectIntent();
    const responses = actionResponses[intent as keyof typeof actionResponses] || [
      "I'm here to help! Could you tell me more about what you're trying to do? Here are some common questions:",
      "I'd be happy to assist! Could you provide more details about what you need help with? Here are some options:",
      "Let me help you with that! Could you clarify what you're looking for? Here are some suggestions:"
    ];
    
    const quickRepliesMap = {
      upload: ['How to upload?', 'Supported formats', 'File size limits'],
      status: ['Check status', 'How long?', 'Download'],
      account: ['Update profile', 'Change password', 'Security'],
      billing: ['View plan', 'Update payment', 'Invoices'],
      general: ['Upload help', 'Translation status', 'Account settings', 'Billing']
    };
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    
    return {
      text: responses[randomIndex],
      quickReplies: quickRepliesMap[intent as keyof typeof quickRepliesMap] || quickRepliesMap.general
    };
  }, [navigate]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage) return;
    
    // Add user message to chat
    const userMessageObj: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessageObj]);
    setMessage('');
    setIsLoading(true);
    playSound('send');
    
    // Simulate typing delay (randomized for realism)
    const typingDelay = Math.floor(Math.random() * 600) + 600; // 600-1200ms
    
    setTimeout(async () => {
      try {
        const botResponse = generateBotResponse(userMessage, context);
        
        // Update context with last topic
        setContext(prev => ({
          ...prev,
          lastTopic: botResponse.quickReplies?.[0]?.toLowerCase() || undefined
        }));
        
        // Add bot response to chat
        const botMessage: Message = {
          id: Date.now().toString(),
          text: botResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: botResponse.quickReplies
        };
        
        setChatMessages(prev => [...prev, botMessage]);
        playSound('receive');
      } catch (error) {
        console.error('Error generating bot response:', error);
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "I'm having trouble understanding. Could you rephrase that?",
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: ['Try again', 'Contact support', 'Main menu']
        };
        
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, typingDelay);
    
    // Update suggestions
    updateSuggestions(userMessage);
  };
  
  // Update suggested replies based on user input
  const updateSuggestions = (input: string) => {
    const suggestions = quickReplies.filter(reply => 
      reply.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestedReplies(suggestions.slice(0, 3));
  };
  
  // Handle quick reply click
  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    // Auto-submit after a short delay
    const event = new Event('submit', { cancelable: true });
    Object.defineProperty(event, 'preventDefault', { value: () => {} });
    setTimeout(() => {
      handleSubmit(event as any);
    }, 100);
  };
  
  // Handle feedback
  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    setChatMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isHelpful } : msg
      )
    );
    
    // Show thank you message
    const feedbackMessage: Message = {
      id: Date.now().toString(),
      text: `Thank you for your feedback! ${isHelpful ? 'I\'m glad I could help!' : 'I\'ll try to do better next time.'}`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, feedbackMessage]);
  };

  // Render message bubbles
  const renderMessage = (msg: Message) => {
    const isUser = msg.sender === 'user';
    const gradient = isUser 
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
      : 'bg-gradient-to-r from-gray-700 to-gray-600';
    
    return (
      <motion.div
        key={msg.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 self-end mb-1">
            <span className="text-white text-sm">🤖</span>
          </div>
        )}
        
        <div className="flex flex-col max-w-[80%]">
          <div 
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-white ${gradient} ${
              isUser ? 'rounded-tr-none' : 'rounded-tl-none'
            }`}
          >
            {msg.text.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
            ))}
            
            {/* Feedback buttons */}
            {!isUser && msg.isHelpful === undefined && !msg.quickReplies && (
              <div className="flex justify-end mt-2 space-x-2">
                <button 
                  onClick={() => handleFeedback(msg.id, true)}
                  className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-2 py-0.5 transition-colors"
                >
                  👍 Helpful
                </button>
                <button 
                  onClick={() => handleFeedback(msg.id, false)}
                  className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-2 py-0.5 transition-colors"
                >
                  👎 Not helpful
                </button>
              </div>
            )}
          </div>
          
          <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {format(msg.timestamp, 'h:mm a')}
          </div>
          
          {/* Quick replies */}
          {!isUser && msg.quickReplies && (
            <div className="flex flex-wrap gap-2 mt-2">
              {msg.quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center ml-2 self-end mb-1">
            <span className="text-white text-sm">👤</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div 
            className={`bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium">AI Assistant</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? '⤵️' : '⤴️'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 p-4 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
              }}
            >
              {chatMessages.map(renderMessage)}
              
              {isLoading && (
                <motion.div
                  className="flex items-center space-x-1 p-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Suggested replies */}
                {suggestedReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestedReplies.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        updateSuggestions(e.target.value);
                      }}
                      placeholder="Type your message..."
                      className="w-full bg-gray-700 text-white rounded-full px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                        isListening 
                          ? 'text-red-500 animate-pulse' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      aria-label={isListening ? 'Stop listening' : 'Use voice input'}
                    >
                      🎤
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open chat"
            style={{
              boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.5)'
            }}
          >
            <span className="text-2xl">💬</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;

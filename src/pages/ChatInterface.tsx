import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Loader2, 
  ArrowLeft, 
  User, 
  ExternalLink, 
  Sparkles,
  Clock,
  Globe,
  History,
  Trash2,
  MessageSquare,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import chatbotApiService, { ChatbotResponse, ConversationResponse } from '@/services/chatbotApi';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: string[];
}

const ChatInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatbot, setChatbot] = useState<ChatbotResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    console.log('🎉 ChatInterface mounted with NEW CODE! Chatbot ID:', id);
    console.log('📝 History feature is ACTIVE');
    if (id) {
      fetchChatbot();
      fetchConversations();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatbot = async () => {
    try {
      const data = await chatbotApiService.chatbot.get(id!);
      setChatbot(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load chatbot',
        variant: 'destructive',
      });
      navigate('/chatbots');
    }
  };

  const fetchConversations = async () => {
    try {
      setIsLoadingHistory(true);
      console.log('Fetching conversations for chatbot:', id);
      const data = await chatbotApiService.conversation.list(id!);
      console.log('Conversations fetched:', data);
      setConversations(data.conversations);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await chatbotApiService.conversation.deleteOne(id!, convId);
      toast({
        title: 'Success',
        description: 'Conversation deleted successfully',
      });
      fetchConversations();
      
      // If current conversation was deleted, start new one
      if (conversationId === convId) {
        setMessages([]);
        setConversationId(undefined);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAllConversations = async () => {
    if (!confirm('Are you sure you want to delete ALL conversations? This cannot be undone.')) return;

    try {
      const result = await chatbotApiService.conversation.deleteAll(id!);
      toast({
        title: 'Success',
        description: `${result.deleted_count} conversation(s) deleted successfully`,
      });
      setConversations([]);
      setMessages([]);
      setConversationId(undefined);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete conversations',
        variant: 'destructive',
      });
    }
  };

  const handleLoadConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      console.log('Loading conversation history for:', convId);
      
      // Fetch full conversation history with messages
      const history = await chatbotApiService.conversation.getHistory(id!, convId);
      console.log('Conversation history loaded:', history);
      
      // Convert API messages to ChatMessage format
      const loadedMessages: ChatMessage[] = history.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.created_at,
        sources: msg.sources,
      }));
      
      setConversationId(convId);
      setMessages(loadedMessages);
      setShowHistory(false);
      
      toast({
        title: 'Conversation Loaded',
        description: `Loaded ${loadedMessages.length} messages from ${history.title || 'previous conversation'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load conversation history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotApiService.chat.sendMessage(id!, {
        message: input,
        conversation_id: conversationId,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setConversationId(response.conversation_id);
      
      // Refresh conversations list
      fetchConversations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <Navbar />
      
      {/* Chat Header - Specific to this chatbot */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chatbots')}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {chatbot && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{chatbot.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>{new URL(chatbot.website_url).hostname}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>{messages.length} messages</span>
                </div>
              )}
              
              {/* History Toggle Button - Specific to this chatbot */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('History button clicked. Current state:', showHistory);
                  console.log('Conversations count:', conversations.length);
                  setShowHistory(!showHistory);
                }}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">History</span>
                {conversations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                    {conversations.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Conversation History</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <Card
                        key={conv.id}
                        className={`p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                          conversationId === conv.conversation_id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1 min-w-0"
                            onClick={() => handleLoadConversation(conv.conversation_id)}
                          >
                            <p className="text-sm font-medium truncate">
                              {conv.title || 'Untitled Conversation'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.conversation_id);
                            }}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Delete All Button */}
              {conversations.length > 0 && (
                <>
                  <Separator />
                  <div className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAllConversations}
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Conversations
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="relative inline-block mb-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Bot className="w-16 h-16 text-primary" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Ask me anything about {chatbot?.name}. I'm powered by the knowledge from {chatbot?.website_url}
              </p>
              
              {/* Suggested Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {[
                  "What services do you offer?",
                  "How can I get started?",
                  "What are your business hours?",
                  "Tell me about your company"
                ].map((question, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setInput(question)}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {question}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2 max-w-[75%]">
                      <Card
                        className={`px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Enhanced Sources Display */}
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-xs font-medium text-muted-foreground">
                                Sources ({message.sources.length})
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium transition-colors group"
                                >
                                  <Globe className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="group-hover:text-primary transition-colors">
                                    {new URL(source).pathname.split('/').filter(Boolean).pop() || 'Home'}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                      
                      {/* Timestamp */}
                      {message.timestamp && (
                        <div className={`flex items-center gap-1 text-xs text-muted-foreground px-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="p-2.5 rounded-xl bg-secondary border border-border">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <Card className="px-5 py-4 bg-card border-border">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t bg-card/80 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-6 py-4 max-w-5xl">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="pr-12 py-6 text-[15px] rounded-xl border-border focus:border-primary transition-colors resize-none"
              />
              <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {input.length}/2000
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              variant="hero"
              size="lg"
              className="px-6 py-6 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          
          {/* Helper Text */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Plus, Trash2, MessageSquare, Loader2, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import chatbotApiService, { 
  ChatbotResponse, 
  ChatbotWizardStart 
} from '@/services/chatbotApi';

const Chatbots = () => {
  const [chatbots, setChatbots] = useState<ChatbotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ChatbotWizardStart>({
    name: '',
    description: '',
    website_url: '',
  });

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      setIsLoading(true);
      const data = await chatbotApiService.chatbot.list();
      setChatbots(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch chatbots',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.website_url) {
      toast({
        title: 'Error',
        description: 'Chatbot name and website URL are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // Start the wizard
      const wizardResponse = await chatbotApiService.wizard.startWizard(formData);
      
      toast({
        title: 'Chatbot Creation Started!',
        description: `${wizardResponse.message}. The website is being scraped...`,
      });

      // Poll for status after initial delay
      const pollInterval = setInterval(async () => {
        try {
          const status = await chatbotApiService.wizard.getStatus(wizardResponse.chatbot_id);
          
          if (status.status === 'completed' || status.status === 'ready') {
            clearInterval(pollInterval);
            
            // Finalize the chatbot (only if not already ready)
            if (status.status === 'completed') {
              await chatbotApiService.wizard.finalize(wizardResponse.chatbot_id);
            }
            
            toast({
              title: 'Success!',
              description: 'Chatbot created and ready to use!',
            });
            
            setIsDialogOpen(false);
            setFormData({
              name: '',
              description: '',
              website_url: '',
            });
            fetchChatbots();
            setIsCreating(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: 'Error',
              description: 'Chatbot creation failed. Please try again.',
              variant: 'destructive',
            });
            setIsCreating(false);
          }
        } catch (error) {
          clearInterval(pollInterval);
          console.error('Status polling error:', error);
          setIsCreating(false);
        }
      }, 10000); // Poll every 10 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isCreating) {
          toast({
            title: 'Timeout',
            description: 'Chatbot creation is taking longer than expected. Please check back later.',
            variant: 'destructive',
          });
          setIsCreating(false);
        }
      }, 300000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create chatbot',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return;

    try {
      await chatbotApiService.chatbot.delete(id);
      toast({
        title: 'Success',
        description: 'Chatbot deleted successfully',
      });
      fetchChatbots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete chatbot',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Chatbots</h1>
            <p className="text-muted-foreground">
              Create and manage your AI chatbots
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Chatbot</DialogTitle>
                <DialogDescription>
                  Configure your AI chatbot with custom settings
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Chatbot Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Support Bot"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website_url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="pl-10"
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The website will be scraped to build the chatbot's knowledge base
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your chatbot's purpose..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    disabled={isCreating}
                  />
                </div>

                {isCreating && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Creating your chatbot...
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          This may take a few minutes while we scrape and process your website
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Chatbot'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chatbots Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chatbots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No chatbots yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first chatbot to get started
            </p>
            <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Chatbot
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot, index) => (
              <motion.div
                key={chatbot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                          <CardDescription className="text-sm flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            {new URL(chatbot.website_url).hostname}
                          </CardDescription>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        chatbot.status === 'completed' || chatbot.status === 'ready'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : chatbot.status === 'processing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {(chatbot.status === 'completed' || chatbot.status === 'ready') && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {chatbot.status === 'processing' && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
                        {chatbot.status === 'pending' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {chatbot.status === 'ready' ? 'Ready' : chatbot.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {chatbot.description || 'No description'}
                    </p>
                    
                    {/* Status Message */}
                    {chatbot.status !== 'completed' && chatbot.status !== 'ready' && (
                      <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {chatbot.status === 'processing' 
                            ? '⏳ Chatbot is being created... Please wait.'
                            : chatbot.status === 'pending'
                            ? '⏸️ Chatbot creation is pending.'
                            : '❌ Chatbot creation failed.'}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          console.log('Navigating to chatbot:', chatbot.id, 'Status:', chatbot.status);
                          navigate(`/chatbot/${chatbot.id}`);
                        }}
                        disabled={chatbot.status !== 'completed' && chatbot.status !== 'ready'}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {(chatbot.status === 'completed' || chatbot.status === 'ready') ? 'Chat' : 'Not Ready'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(chatbot.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbots;


import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import apiService from '@/services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await apiService.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Email verification failed.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
            style={{ background: 'var(--gradient-glow)' }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass rounded-3xl p-8">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4"
                >
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-2">Verifying Your Email</h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/10 mb-4"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-2 text-green-500">
                  Email Verified!
                </h1>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting to login page in 3 seconds...
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 mb-4"
                >
                  <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-2 text-red-500">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                
                <div className="space-y-3">
                  <Link to="/resend-verification">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Request New Verification Link
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;


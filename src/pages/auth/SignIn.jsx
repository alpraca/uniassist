import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to continue your educational journey</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <SignIn 
              routing="path" 
              path="/auth/signin"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none p-0",
                  header: "hidden",
                  footer: "hidden"
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage; 
"use client";

import React from "react";
import { motion } from "framer-motion";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import { useAuth } from "@/lib/auth/AuthProvider";

type AuthMode = "login" | "signup" | "forgot-password";

interface AuthPageProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onSuccess?: (user: any) => void;
  className?: string;
}

export default function AuthPage({ 
  mode = "login", 
  onModeChange, 
  onSuccess,
  className = ""
}: AuthPageProps) {
  const [currentMode, setCurrentMode] = React.useState<AuthMode>(mode);
  const { login, signup, loading: authLoading } = useAuth();

  const handleModeChange = (newMode: AuthMode) => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  const renderAuthComponent = () => {
    switch (currentMode) {
      case "login":
        return (
          <Login 
            onSwitchToSignup={() => handleModeChange("signup")}
            onForgotPassword={() => handleModeChange("forgot-password")}
            onSuccess={onSuccess}
            onLogin={login}
            isLoading={authLoading}
          />
        );
      case "signup":
        return (
          <Signup 
            onSwitchToLogin={() => handleModeChange("login")}
            onSuccess={onSuccess}
            onSignup={signup}
            isLoading={authLoading}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword 
            onBackToLogin={() => handleModeChange("login")}
          />
        );
      default:
        return (
          <Login 
            onSwitchToSignup={() => handleModeChange("signup")}
            onForgotPassword={() => handleModeChange("forgot-password")}
            onSuccess={onSuccess}
            onLogin={login}
            isLoading={authLoading}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">GA</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">GameArchade</h1>
            <p className="text-white/70">Welcome to the ultimate gaming experience</p>
          </div>
          
          {renderAuthComponent()}
        </motion.div>
      </div>
    </div>
  );
}
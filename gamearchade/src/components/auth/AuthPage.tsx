"use client";

import React from "react";
import { motion } from "framer-motion";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

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
          />
        );
      case "signup":
        return (
          <Signup 
            onSwitchToLogin={() => handleModeChange("login")}
            onSuccess={onSuccess}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword 
            onBackToLogin={() => handleModeChange("login")}
          />
        );
      case "reset-password":
        return (
          <ResetPassword 
            onBackToLogin={() => handleModeChange("login")}
          />
        );
      default:
        return (
          <Login 
            onSwitchToSignup={() => handleModeChange("signup")}
            onForgotPassword={() => handleModeChange("forgot-password")}
            onSuccess={onSuccess}
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
            <h1 className="text-3xl font-bold text-white mb-2">GameArchade</h1>
            <p className="text-white/70">Welcome to the ultimate gaming experience</p>
          </div>
          
          {renderAuthComponent()}
        </motion.div>
      </div>
    </div>
  );
}
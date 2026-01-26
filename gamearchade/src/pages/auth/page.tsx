// Enhanced Auth page client implementation for GameArchade

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";

// Types
import type {
  AuthPageProps,
  AuthPageConfig,
  AuthMode,
  AuthPageError,
  AuthLayoutProps
} from "@/types/auth/page";
import type { AuthResponse } from "@/types/auth/auth";

// Utilities
import { AuthPageHelpers } from "@/utility/auth/page-helpers";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * Enhanced Auth Page Client
 */
export class AuthPageClient {
  private static instance: AuthPageClient | null = null;
  private logger: Logger;
  private config: AuthPageConfig;

  constructor(config: Partial<AuthPageConfig> = {}) {
    this.logger = new Logger({ tag: 'AUTH_PAGE' });
    this.config = AuthPageHelpers.Config.createDefaultConfig(config);
  }

  /**
   * Singleton instance
   */
  static getInstance(config?: Partial<AuthPageConfig>): AuthPageClient {
    if (!AuthPageClient.instance) {
      AuthPageClient.instance = new AuthPageClient(config);
    }
    return AuthPageClient.instance;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): AuthPageConfig {
    return this.config;
  }

  /**
   * Validate auth mode
   */
  validateMode(mode: string): AuthMode {
    const validModes: AuthMode[] = ['login', 'signup', 'forgot-password', 'reset-password'];
    if (validModes.includes(mode as AuthMode)) {
      return mode as AuthMode;
    }
    this.logger.warn('Invalid auth mode provided, defaulting to login', { mode });
    return 'login';
  }

  /**
   * Get mode from URL
   */
  getModeFromUrl(pathname: string, searchParams: URLSearchParams): AuthMode {
    // Check search params first
    const modeParam = searchParams.get('mode');
    if (modeParam) {
      return this.validateMode(modeParam);
    }

    // Check pathname
    if (pathname.includes('signup')) return 'signup';
    if (pathname.includes('forgot-password')) return 'forgot-password';
    if (pathname.includes('reset-password')) return 'reset-password';
    
    return 'login';
  }

  /**
   * Handle successful authentication
   */
  async handleAuthSuccess(data: AuthResponse, mode: AuthMode, redirectTo?: string): Promise<void> {
    this.logger.info('Authentication successful', { mode, userId: data.user.id });

    // Store auth data (this would typically be handled by your auth context/store)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
    }

    // Determine redirect URL
    const defaultRedirect = mode === 'login' 
      ? this.config.redirectAfterLogin 
      : this.config.redirectAfterSignup;
    
    const targetUrl = redirectTo || defaultRedirect;

    // Use Next.js router for navigation
    if (typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
  }

  /**
   * Handle auth error
   */
  handleAuthError(error: AuthPageError, mode: AuthMode): void {
    this.logger.error('Authentication error', { error, mode });
  }
}

/**
 * Auth Layout Component
 */
function AuthLayout({ 
  children, 
  title = "Gaming Arcade", 
  subtitle = "Welcome to the ultimate gaming experience",
  showFooter = true,
  className = ""
}: AuthLayoutProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${className}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-subtle-text">{subtitle}</p>
        </motion.div>

        {/* Auth Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Footer */}
        {showFooter && (
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-subtle-text text-sm">
              You will enjoy the platform.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Auth Component Renderer
 */
function AuthComponentRenderer({
  mode,
  onModeChange,
  onSuccess,
  onError,
  config,
  isLoading = false
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  config: AuthPageConfig;
  isLoading?: boolean;
}) {
  const componentProps = {
    onModeChange,
    onSuccess,
    onError,
    isLoading
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'login' && <Login {...componentProps} />}
        {mode === 'signup' && <Signup {...componentProps} />}
        {mode === 'forgot-password' && <ForgotPassword {...componentProps} />}
        {mode === 'reset-password' && <ResetPassword {...componentProps} />}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Main Game Auth Page Component
 */
export function GameAuthPage({
  mode: initialMode,
  redirectTo,
  config: configOverride,
  onModeChange: externalModeChange,
  onSuccess: externalSuccess,
  onError: externalError,
  className,
  children
}: AuthPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useMemo(() => AuthPageClient.getInstance(configOverride), [configOverride]);
  
  // State management
  const [currentMode, setCurrentMode] = useState<AuthMode>(
    initialMode || client.getModeFromUrl(window?.location?.pathname || '', searchParams)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthPageError | null>(null);

  // Configuration
  const config = useMemo(() => 
    client.getDefaultConfig(), 
    [client]
  );

  // Handle mode changes
  const handleModeChange = useCallback((newMode: AuthMode) => {
    setCurrentMode(newMode);
    setError(null);
    
    // Update URL without navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('mode', newMode);
    window.history.replaceState({}, '', newUrl.toString());
    
    // Call external handler
    externalModeChange?.(newMode);
  }, [externalModeChange]);

  // Handle successful authentication
  const handleSuccess = useCallback(async (data: AuthResponse) => {
    setIsLoading(true);
    try {
      await client.handleAuthSuccess(data, currentMode, redirectTo);
      externalSuccess?.(data);
    } catch (err) {
      const error: AuthPageError = {
        type: 'SERVER_ERROR',
        message: 'Failed to complete authentication',
        code: 'AUTH_SUCCESS_ERROR',
        details: { originalError: err }
      };
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [client, currentMode, redirectTo, externalSuccess]);

  // Handle errors
  const handleError = useCallback((error: AuthPageError) => {
    setError(error);
    client.handleAuthError(error, currentMode);
    externalError?.(error);
  }, [client, currentMode, externalError]);

  // Check for URL-based error messages
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const error: AuthPageError = {
        type: 'SERVER_ERROR',
        message: decodeURIComponent(errorParam),
        code: 'URL_ERROR'
      };
      handleError(error);
    }
  }, [searchParams, handleError]);

  // Handle initial mode from URL
  useEffect(() => {
    if (!initialMode) {
      const urlMode = client.getModeFromUrl(window?.location?.pathname || '', searchParams);
      if (urlMode !== currentMode) {
        setCurrentMode(urlMode);
      }
    }
  }, [client, searchParams, initialMode, currentMode]);

  // Custom children override
  if (children) {
    return (
      <AuthLayout className={className}>
        {children}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout className={className}>
      {error && (
        <motion.div 
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-red-400 text-sm">{error.message}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 text-xs mt-1"
          >
            Dismiss
          </button>
        </motion.div>
      )}
      
      <AuthComponentRenderer
        mode={currentMode}
        onModeChange={handleModeChange}
        onSuccess={handleSuccess}
        onError={handleError}
        config={config}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

/**
 * Legacy Auth component for backward compatibility
 */
export default function Auth() {
  return <GameAuthPage />;
}

/**
 * Export client class
 */
export { AuthPageClient };

/**
 * Export layout for reuse
 */
export { AuthLayout };
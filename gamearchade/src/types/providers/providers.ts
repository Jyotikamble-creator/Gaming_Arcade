// Provider TypeScript interfaces and types

import { ReactNode } from "react";
import { Store } from "@reduxjs/toolkit";
import { QueryClient } from "@tanstack/react-query";

/**
 * Core provider interfaces
 */
export interface IProvidersClient {
  initialize(): Promise<void>;
  cleanup(): void;
  getStore(): Store;
  getQueryClient(): QueryClient;
  isInitialized(): boolean;
}

export interface IAuthProvider {
  restoreSession(): Promise<void>;
  clearSession(): void;
  validateToken(token: string): boolean;
  refreshToken(): Promise<string | null>;
}

export interface IThemeProvider {
  getTheme(): Theme;
  setTheme(theme: Theme): void;
  toggleTheme(): void;
  resetTheme(): void;
}

export interface IQueryProvider {
  invalidateQueries(queryKey?: string[]): Promise<void>;
  removeQueries(queryKey: string[]): void;
  getQueryData<T>(queryKey: string[]): T | undefined;
  setQueryData<T>(queryKey: string[], data: T): void;
}

/**
 * Provider configuration
 */
export interface ProvidersConfig {
  redux: ReduxConfig;
  query: QueryConfig;
  theme: ThemeConfig;
  auth: AuthConfig;
  storage: StorageConfig;
}

export interface ReduxConfig {
  enableDevTools?: boolean;
  enableLogger?: boolean;
  preloadedState?: Record<string, any>;
  middleware?: any[];
  enhancers?: any[];
}

export interface QueryConfig {
  defaultOptions?: {
    queries?: {
      staleTime?: number;
      cacheTime?: number;
      retry?: boolean | number;
      refetchOnWindowFocus?: boolean;
      refetchOnMount?: boolean;
      refetchOnReconnect?: boolean;
    };
    mutations?: {
      retry?: boolean | number;
      retryDelay?: number;
    };
  };
  enableDevTools?: boolean;
  logger?: {
    log: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
  };
}

export interface ThemeConfig {
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystemTheme?: boolean;
  enableTransitions?: boolean;
  customThemes?: Record<string, ThemeDefinition>;
}

export interface AuthConfig {
  tokenKey?: string;
  userIdKey?: string;
  sessionKey?: string;
  autoRestore?: boolean;
  validateOnRestore?: boolean;
  refreshOnExpiry?: boolean;
  clearOnError?: boolean;
}

export interface StorageConfig {
  prefix?: string;
  enableEncryption?: boolean;
  fallbackToSessionStorage?: boolean;
  enableCompression?: boolean;
}

/**
 * Theme types
 */
export type Theme = 
  | "light" 
  | "dark" 
  | "system" 
  | "auto"
  | "gaming"
  | "neon"
  | "retro";

export interface ThemeDefinition {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

/**
 * Provider component props
 */
export interface ProvidersProps {
  children: ReactNode;
  config?: Partial<ProvidersConfig>;
  enableDevTools?: boolean;
  enablePersistence?: boolean;
  fallbackComponent?: ReactNode;
  errorBoundary?: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
  config?: Partial<AuthConfig>;
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: Error) => void;
  onSessionExpired?: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  config?: Partial<ThemeConfig>;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

export interface QueryProviderProps {
  children: ReactNode;
  config?: Partial<QueryConfig>;
  client?: QueryClient;
  enableDevTools?: boolean;
}

/**
 * Provider context types
 */
export interface ProvidersContextValue {
  store: Store;
  queryClient: QueryClient;
  theme: Theme;
  isInitialized: boolean;
  config: ProvidersConfig;
  setTheme: (theme: Theme) => void;
  resetProviders: () => Promise<void>;
  getProviderStatus: () => ProviderStatus;
}

export interface AuthContextValue {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export interface ThemeContextValue {
  theme: Theme;
  themeDefinition: ThemeDefinition;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  availableThemes: Theme[];
  customThemes: Record<string, ThemeDefinition>;
  addCustomTheme: (name: string, definition: ThemeDefinition) => void;
}

/**
 * Authentication types
 */
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms: boolean;
  newsletter?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  stats: UserStats;
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    gameUpdates: boolean;
    achievements: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showAchievements: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number; // in minutes
  favoriteGame: string;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: {
    current: number;
    required: number;
  };
}

/**
 * Provider status and monitoring
 */
export interface ProviderStatus {
  redux: {
    isConnected: boolean;
    storeSize: number;
    lastAction: string;
    actionCount: number;
  };
  query: {
    isConnected: boolean;
    cacheSize: number;
    queryCount: number;
    mutationCount: number;
    isFetching: boolean;
  };
  theme: {
    currentTheme: Theme;
    isSystemTheme: boolean;
    hasCustomThemes: boolean;
    transitionsEnabled: boolean;
  };
  auth: {
    isAuthenticated: boolean;
    tokenExpiry: Date | null;
    sessionActive: boolean;
    lastActivity: Date | null;
  };
}

/**
 * Provider events
 */
export interface ProviderEvent {
  type: ProviderEventType;
  timestamp: Date;
  source: string;
  data?: any;
  error?: Error;
}

export type ProviderEventType =
  | 'PROVIDERS_INITIALIZED'
  | 'PROVIDERS_ERROR'
  | 'REDUX_ACTION_DISPATCHED'
  | 'QUERY_STARTED'
  | 'QUERY_SUCCESS'
  | 'QUERY_ERROR'
  | 'THEME_CHANGED'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_TOKEN_REFRESHED'
  | 'AUTH_SESSION_EXPIRED'
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'PROVIDER_CLEANUP';

/**
 * Provider error types
 */
export interface ProviderError extends Error {
  code: string;
  type: ProviderErrorType;
  source: string;
  context?: Record<string, any>;
  recoverable: boolean;
  timestamp: Date;
}

export type ProviderErrorType =
  | 'INITIALIZATION_ERROR'
  | 'REDUX_ERROR'
  | 'QUERY_ERROR'
  | 'THEME_ERROR'
  | 'AUTH_ERROR'
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'CONFIGURATION_ERROR';

/**
 * Storage utilities
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // time to live in milliseconds
  prefix?: string;
}

/**
 * Provider utilities
 */
export interface ProviderUtils {
  validateConfig(config: Partial<ProvidersConfig>): ProvidersConfig;
  mergeConfigs(base: ProvidersConfig, override: Partial<ProvidersConfig>): ProvidersConfig;
  createDefaultConfig(): ProvidersConfig;
  sanitizeConfig(config: ProvidersConfig): ProvidersConfig;
}

/**
 * Provider analytics
 */
export interface ProviderAnalytics {
  trackEvent(event: ProviderEvent): void;
  getMetrics(): ProviderMetrics;
  getPerformanceReport(): ProviderPerformanceReport;
  exportData(): string;
}

export interface ProviderMetrics {
  totalEvents: number;
  eventsByType: Record<ProviderEventType, number>;
  errorRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  userSessions: number;
  activeQueries: number;
}

export interface ProviderPerformanceReport {
  initializationTime: number;
  reduxPerformance: {
    averageActionTime: number;
    slowActions: Array<{ action: string; time: number }>;
    storeSize: number;
  };
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: Array<{ query: string; time: number }>;
    cacheEfficiency: number;
  };
  themePerformance: {
    switchTime: number;
    renderTime: number;
  };
  authPerformance: {
    loginTime: number;
    tokenRefreshTime: number;
    logoutTime: number;
  };
  recommendations: string[];
}

/**
 * Export all types
 */
export type {
  // Core interfaces
  IProvidersClient,
  IAuthProvider,
  IThemeProvider,
  IQueryProvider,
  
  // Configuration
  ProvidersConfig,
  ReduxConfig,
  QueryConfig,
  ThemeConfig,
  AuthConfig,
  StorageConfig,
  
  // Component props
  ProvidersProps,
  AuthProviderProps,
  ThemeProviderProps,
  QueryProviderProps,
  
  // Context values
  ProvidersContextValue,
  AuthContextValue,
  ThemeContextValue,
  
  // Theme types
  Theme,
  ThemeDefinition,
  
  // Auth types
  LoginCredentials,
  RegisterData,
  UserProfile,
  UserPreferences,
  UserStats,
  Achievement,
  
  // Monitoring
  ProviderStatus,
  ProviderEvent,
  ProviderEventType,
  ProviderError,
  ProviderErrorType,
  
  // Utilities
  StorageAdapter,
  SecureStorageOptions,
  ProviderUtils,
  ProviderAnalytics,
  ProviderMetrics,
  ProviderPerformanceReport
};
// Provider utility functions and helpers

import type {
  ProvidersConfig,
  ReduxConfig,
  QueryConfig,
  ThemeConfig,
  AuthConfig,
  StorageConfig,
  Theme,
  ThemeDefinition,
  ProviderEvent,
  ProviderMetrics,
  ProviderPerformanceReport,
  StorageAdapter,
  SecureStorageOptions
} from "@/types/providers/providers";

/**
 * Providers configuration utilities
 */
export class ProvidersUtils {
  /**
   * Create default providers configuration
   */
  static createDefaultConfig(override: Partial<ProvidersConfig> = {}): ProvidersConfig {
    const defaultConfig: ProvidersConfig = {
      redux: {
        enableDevTools: process.env.NODE_ENV === 'development',
        enableLogger: process.env.NODE_ENV === 'development',
        preloadedState: {},
        middleware: [],
        enhancers: []
      },
      query: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 3,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true
          },
          mutations: {
            retry: 1,
            retryDelay: 1000
          }
        },
        enableDevTools: process.env.NODE_ENV === 'development'
      },
      theme: {
        defaultTheme: 'light',
        storageKey: 'gamearchade_theme',
        enableSystemTheme: true,
        enableTransitions: true,
        customThemes: {}
      },
      auth: {
        tokenKey: 'gamearchade_token',
        userIdKey: 'gamearchade_userId',
        sessionKey: 'gamearchade_session',
        autoRestore: true,
        validateOnRestore: true,
        refreshOnExpiry: true,
        clearOnError: true
      },
      storage: {
        prefix: 'gamearchade_',
        enableEncryption: false,
        fallbackToSessionStorage: true,
        enableCompression: false
      }
    };

    return this.mergeConfigs(defaultConfig, override);
  }

  /**
   * Merge configurations deeply
   */
  static mergeConfigs(base: ProvidersConfig, override: Partial<ProvidersConfig>): ProvidersConfig {
    const merged = { ...base };

    if (override.redux) {
      merged.redux = { ...base.redux, ...override.redux };
    }

    if (override.query) {
      merged.query = { 
        ...base.query, 
        ...override.query,
        defaultOptions: {
          ...base.query.defaultOptions,
          ...override.query.defaultOptions,
          queries: {
            ...base.query.defaultOptions?.queries,
            ...override.query.defaultOptions?.queries
          },
          mutations: {
            ...base.query.defaultOptions?.mutations,
            ...override.query.defaultOptions?.mutations
          }
        }
      };
    }

    if (override.theme) {
      merged.theme = { 
        ...base.theme, 
        ...override.theme,
        customThemes: {
          ...base.theme.customThemes,
          ...override.theme.customThemes
        }
      };
    }

    if (override.auth) {
      merged.auth = { ...base.auth, ...override.auth };
    }

    if (override.storage) {
      merged.storage = { ...base.storage, ...override.storage };
    }

    return merged;
  }

  /**
   * Validate providers configuration
   */
  static validateConfig(config: Partial<ProvidersConfig>): ProvidersConfig {
    const validated = this.createDefaultConfig(config);

    // Validate theme configuration
    if (validated.theme.defaultTheme) {
      const validThemes: Theme[] = ['light', 'dark', 'system', 'auto', 'gaming', 'neon', 'retro'];
      if (!validThemes.includes(validated.theme.defaultTheme)) {
        console.warn(`Invalid default theme: ${validated.theme.defaultTheme}. Using 'light' instead.`);
        validated.theme.defaultTheme = 'light';
      }
    }

    // Validate storage keys
    if (validated.storage.prefix && typeof validated.storage.prefix !== 'string') {
      console.warn('Invalid storage prefix. Using default.');
      validated.storage.prefix = 'gamearchade_';
    }

    // Validate auth keys
    const authKeys = ['tokenKey', 'userIdKey', 'sessionKey'] as const;
    authKeys.forEach(key => {
      if (validated.auth[key] && typeof validated.auth[key] !== 'string') {
        console.warn(`Invalid auth ${key}. Using default.`);
        validated.auth[key] = `gamearchade_${key.replace('Key', '')}`;
      }
    });

    return validated;
  }

  /**
   * Sanitize configuration for logging/debugging
   */
  static sanitizeConfig(config: ProvidersConfig): ProvidersConfig {
    const sanitized = JSON.parse(JSON.stringify(config));

    // Remove sensitive data
    if (sanitized.auth) {
      delete sanitized.auth.tokenKey;
      delete sanitized.auth.sessionKey;
    }

    if (sanitized.redux && sanitized.redux.preloadedState) {
      sanitized.redux.preloadedState = '[REDACTED]';
    }

    return sanitized;
  }
}

/**
 * Theme utilities
 */
export class ThemeUtils {
  /**
   * Default theme definitions
   */
  private static readonly defaultThemes: Record<Theme, ThemeDefinition> = {
    light: {
      name: 'light',
      displayName: 'Light',
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      },
      animation: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      }
    },
    dark: {
      name: 'dark',
      displayName: 'Dark',
      colors: {
        primary: '#3b82f6',
        secondary: '#9ca3af',
        accent: '#10b981',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        border: '#374151',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.2)'
      },
      animation: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      }
    },
    gaming: {
      name: 'gaming',
      displayName: 'Gaming',
      colors: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#06d6a0',
        background: '#0f0f0f',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a3a3a3',
        border: '#333333',
        error: '#ff6b6b',
        warning: '#ffd93d',
        success: '#06d6a0',
        info: '#74c0fc'
      },
      typography: {
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        full: '0.5rem'
      },
      shadows: {
        sm: '0 0 10px rgba(139, 92, 246, 0.2)',
        md: '0 0 20px rgba(139, 92, 246, 0.3)',
        lg: '0 0 30px rgba(139, 92, 246, 0.4)',
        xl: '0 0 40px rgba(139, 92, 246, 0.5)'
      },
      animation: {
        duration: {
          fast: '100ms',
          normal: '200ms',
          slow: '400ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
          easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        }
      }
    },
    // Add other theme implementations...
    system: {
      name: 'system',
      displayName: 'System',
      colors: {
        primary: '#007AFF',
        secondary: '#8E8E93',
        accent: '#34C759',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C6C6C8',
        error: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        info: '#007AFF'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          bold: 600
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
      },
      animation: {
        duration: {
          fast: '200ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      }
    },
    auto: {} as ThemeDefinition, // Would be dynamically set
    neon: {} as ThemeDefinition, // Would be implemented
    retro: {} as ThemeDefinition // Would be implemented
  };

  /**
   * Get theme definition
   */
  static getThemeDefinition(theme: Theme): ThemeDefinition {
    return this.defaultThemes[theme] || this.defaultThemes.light;
  }

  /**
   * Detect system theme preference
   */
  static detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Apply theme to CSS variables
   */
  static applyThemeToCSS(theme: ThemeDefinition): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    root.style.setProperty('--font-family', theme.typography.fontFamily);

    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animation
    Object.entries(theme.animation.duration).forEach(([key, value]) => {
      root.style.setProperty(`--animation-duration-${key}`, value);
    });

    Object.entries(theme.animation.easing).forEach(([key, value]) => {
      root.style.setProperty(`--animation-easing-${key}`, value);
    });
  }

  /**
   * Create custom theme
   */
  static createCustomTheme(
    baseName: Theme,
    overrides: Partial<ThemeDefinition>,
    customName: string
  ): ThemeDefinition {
    const baseTheme = this.getThemeDefinition(baseName);
    
    return {
      ...baseTheme,
      name: customName,
      displayName: overrides.displayName || customName,
      colors: { ...baseTheme.colors, ...overrides.colors },
      typography: { 
        ...baseTheme.typography, 
        ...overrides.typography,
        fontSize: { ...baseTheme.typography.fontSize, ...overrides.typography?.fontSize },
        fontWeight: { ...baseTheme.typography.fontWeight, ...overrides.typography?.fontWeight }
      },
      spacing: { ...baseTheme.spacing, ...overrides.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
      shadows: { ...baseTheme.shadows, ...overrides.shadows },
      animation: {
        duration: { ...baseTheme.animation.duration, ...overrides.animation?.duration },
        easing: { ...baseTheme.animation.easing, ...overrides.animation?.easing }
      }
    };
  }

  /**
   * Validate theme definition
   */
  static validateTheme(theme: Partial<ThemeDefinition>): boolean {
    const required = ['name', 'displayName', 'colors'];
    return required.every(key => key in theme);
  }
}

/**
 * Storage utilities
 */
export class StorageUtils {
  /**
   * Create storage adapter
   */
  static createStorageAdapter(type: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage'): StorageAdapter {
    if (typeof window === 'undefined') {
      return this.createMemoryStorage();
    }

    switch (type) {
      case 'localStorage':
        return this.createLocalStorageAdapter();
      case 'sessionStorage':
        return this.createSessionStorageAdapter();
      default:
        return this.createMemoryStorage();
    }
  }

  /**
   * Create local storage adapter
   */
  private static createLocalStorageAdapter(): StorageAdapter {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear(),
      key: (index: number) => localStorage.key(index),
      get length() { return localStorage.length; }
    };
  }

  /**
   * Create session storage adapter
   */
  private static createSessionStorageAdapter(): StorageAdapter {
    return {
      getItem: (key: string) => sessionStorage.getItem(key),
      setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
      removeItem: (key: string) => sessionStorage.removeItem(key),
      clear: () => sessionStorage.clear(),
      key: (index: number) => sessionStorage.key(index),
      get length() { return sessionStorage.length; }
    };
  }

  /**
   * Create memory storage adapter
   */
  private static createMemoryStorage(): StorageAdapter {
    const storage = new Map<string, string>();
    
    return {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
      removeItem: (key: string) => { storage.delete(key); },
      clear: () => { storage.clear(); },
      key: (index: number) => Array.from(storage.keys())[index] || null,
      get length() { return storage.size; }
    };
  }

  /**
   * Secure storage operations
   */
  static setSecureItem(
    storage: StorageAdapter,
    key: string,
    value: any,
    options: SecureStorageOptions = {}
  ): void {
    try {
      let serialized = JSON.stringify(value);

      // Apply compression if enabled
      if (options.compress) {
        serialized = this.compress(serialized);
      }

      // Apply encryption if enabled
      if (options.encrypt) {
        serialized = this.encrypt(serialized);
      }

      const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
      
      // Add TTL if specified
      if (options.ttl) {
        const data = {
          value: serialized,
          expiry: Date.now() + options.ttl
        };
        serialized = JSON.stringify(data);
      }

      storage.setItem(prefixedKey, serialized);
    } catch (error) {
      console.error('Failed to set secure item:', error);
    }
  }

  /**
   * Get secure storage item
   */
  static getSecureItem(
    storage: StorageAdapter,
    key: string,
    options: SecureStorageOptions = {}
  ): any {
    try {
      const prefixedKey = options.prefix ? `${options.prefix}${key}` : key;
      let stored = storage.getItem(prefixedKey);
      
      if (!stored) return null;

      // Handle TTL
      if (options.ttl) {
        try {
          const data = JSON.parse(stored);
          if (data.expiry && Date.now() > data.expiry) {
            storage.removeItem(prefixedKey);
            return null;
          }
          stored = data.value;
        } catch {
          // Invalid TTL format, treat as regular data
        }
      }

      // Apply decryption if enabled
      if (options.encrypt) {
        stored = this.decrypt(stored);
      }

      // Apply decompression if enabled
      if (options.compress) {
        stored = this.decompress(stored);
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to get secure item:', error);
      return null;
    }
  }

  /**
   * Simple compression (placeholder)
   */
  private static compress(data: string): string {
    // In a real implementation, you'd use a compression library
    return data;
  }

  /**
   * Simple decompression (placeholder)
   */
  private static decompress(data: string): string {
    // In a real implementation, you'd use a compression library
    return data;
  }

  /**
   * Simple encryption (placeholder)
   */
  private static encrypt(data: string): string {
    // In a real implementation, you'd use proper encryption
    return btoa(data);
  }

  /**
   * Simple decryption (placeholder)
   */
  private static decrypt(data: string): string {
    // In a real implementation, you'd use proper decryption
    try {
      return atob(data);
    } catch {
      return data;
    }
  }
}

/**
 * Provider analytics utilities
 */
export class ProviderAnalytics {
  private events: ProviderEvent[] = [];
  private readonly maxEvents = 1000;

  /**
   * Track provider event
   */
  trackEvent(event: ProviderEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get provider metrics
   */
  getMetrics(): ProviderMetrics {
    const totalEvents = this.events.length;
    const eventsByType: Record<string, number> = {};
    
    let errorCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    this.events.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      // Count errors
      if (event.type.includes('ERROR')) {
        errorCount++;
      }
      
      // Track response times
      if (event.data?.responseTime) {
        totalResponseTime += event.data.responseTime;
        responseTimeCount++;
      }
    });

    const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0;
    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return {
      totalEvents,
      eventsByType: eventsByType as any,
      errorRate,
      averageResponseTime,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
      userSessions: this.countUserSessions(),
      activeQueries: this.countActiveQueries()
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): ProviderPerformanceReport {
    const initEvents = this.events.filter(e => e.type === 'PROVIDERS_INITIALIZED');
    const initializationTime = initEvents.length > 0 ? initEvents[0].data?.initTime || 0 : 0;

    const reduxEvents = this.events.filter(e => e.type === 'REDUX_ACTION_DISPATCHED');
    const queryEvents = this.events.filter(e => e.type.includes('QUERY'));
    const themeEvents = this.events.filter(e => e.type === 'THEME_CHANGED');
    const authEvents = this.events.filter(e => e.type.includes('AUTH'));

    return {
      initializationTime,
      reduxPerformance: {
        averageActionTime: this.calculateAverageTime(reduxEvents),
        slowActions: this.findSlowActions(reduxEvents),
        storeSize: this.estimateStoreSize()
      },
      queryPerformance: {
        averageQueryTime: this.calculateAverageTime(queryEvents),
        slowQueries: this.findSlowQueries(queryEvents),
        cacheEfficiency: this.calculateCacheHitRate()
      },
      themePerformance: {
        switchTime: this.calculateAverageTime(themeEvents),
        renderTime: 0 // Would need DOM measurement
      },
      authPerformance: {
        loginTime: this.calculateAverageTime(authEvents.filter(e => e.type === 'AUTH_LOGIN')),
        tokenRefreshTime: this.calculateAverageTime(authEvents.filter(e => e.type === 'AUTH_TOKEN_REFRESHED')),
        logoutTime: this.calculateAverageTime(authEvents.filter(e => e.type === 'AUTH_LOGOUT'))
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    const data = {
      events: this.events,
      metrics: this.getMetrics(),
      performance: this.getPerformanceReport(),
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Private helper methods
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private calculateCacheHitRate(): number {
    const cacheEvents = this.events.filter(e => e.data?.cacheHit !== undefined);
    if (cacheEvents.length === 0) return 0;
    
    const hits = cacheEvents.filter(e => e.data.cacheHit).length;
    return (hits / cacheEvents.length) * 100;
  }

  private countUserSessions(): number {
    const sessionIds = new Set(this.events.map(e => e.data?.sessionId).filter(Boolean));
    return sessionIds.size;
  }

  private countActiveQueries(): number {
    const queryStartEvents = this.events.filter(e => e.type === 'QUERY_STARTED');
    const queryEndEvents = this.events.filter(e => e.type === 'QUERY_SUCCESS' || e.type === 'QUERY_ERROR');
    
    return Math.max(0, queryStartEvents.length - queryEndEvents.length);
  }

  private calculateAverageTime(events: ProviderEvent[]): number {
    const timings = events.map(e => e.data?.responseTime || e.data?.duration).filter(Boolean);
    return timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0;
  }

  private findSlowActions(events: ProviderEvent[]): Array<{ action: string; time: number }> {
    return events
      .filter(e => e.data?.duration > 100) // Actions taking more than 100ms
      .map(e => ({ action: e.data?.action || 'unknown', time: e.data?.duration }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  }

  private findSlowQueries(events: ProviderEvent[]): Array<{ query: string; time: number }> {
    return events
      .filter(e => e.data?.responseTime > 1000) // Queries taking more than 1s
      .map(e => ({ query: e.data?.queryKey?.join('.') || 'unknown', time: e.data?.responseTime }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  }

  private estimateStoreSize(): number {
    // This would need access to actual store
    return 0;
  }

  private generateRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    if (metrics.errorRate > 5) {
      recommendations.push('High error rate detected. Consider implementing better error boundaries.');
    }

    if (metrics.averageResponseTime > 2000) {
      recommendations.push('Slow response times detected. Consider implementing caching strategies.');
    }

    if (metrics.cacheHitRate < 80) {
      recommendations.push('Low cache hit rate. Consider optimizing query keys and stale time.');
    }

    return recommendations;
  }
}

/**
 * Export all utilities as a combined object
 */
export const ProvidersHelpers = {
  Config: ProvidersUtils,
  Theme: ThemeUtils,
  Storage: StorageUtils,
  Analytics: ProviderAnalytics
};
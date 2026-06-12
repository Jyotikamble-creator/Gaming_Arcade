// Logger utility functions and helpers

import type {
  LogLevel,
  ILogEntry,
  LogAnalytics,
  LogSearchCriteria,
  Environment,
  LoggerConfig
} from "@/types/logger/logger";

/**
 * Log level utilities
 */
export class LogLevelUtils {
  private static readonly LEVEL_HIERARCHY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  };

  private static readonly LEVEL_COLORS: Record<LogLevel, string> = {
    debug: '#6b7280', // gray
    info: '#3b82f6',  // blue
    warn: '#f59e0b',  // amber
    error: '#ef4444', // red
    critical: '#dc2626' // dark red
  };

  /**
   * Check if a log level meets the minimum threshold
   */
  static isLevelEnabled(level: LogLevel, minLevel: LogLevel): boolean {
    return this.LEVEL_HIERARCHY[level] >= this.LEVEL_HIERARCHY[minLevel];
  }

  /**
   * Get numeric value for log level
   */
  static getLevelValue(level: LogLevel): number {
    return this.LEVEL_HIERARCHY[level];
  }

  /**
   * Get color for log level
   */
  static getLevelColor(level: LogLevel): string {
    return this.LEVEL_COLORS[level];
  }

  /**
   * Get all log levels in order
   */
  static getAllLevels(): LogLevel[] {
    return Object.keys(this.LEVEL_HIERARCHY) as LogLevel[];
  }

  /**
   * Get levels at or above threshold
   */
  static getLevelsAbove(threshold: LogLevel): LogLevel[] {
    const thresholdValue = this.LEVEL_HIERARCHY[threshold];
    return Object.entries(this.LEVEL_HIERARCHY)
      .filter(([_, value]) => value >= thresholdValue)
      .map(([level, _]) => level as LogLevel);
  }

  /**
   * Parse log level from string (case insensitive)
   */
  static parseLevel(levelStr: string): LogLevel {
    const level = levelStr.toLowerCase() as LogLevel;
    if (level in this.LEVEL_HIERARCHY) {
      return level;
    }
    throw new Error(`Invalid log level: ${levelStr}`);
  }
}

/**
 * Log formatting utilities
 */
export class LogFormatter {
  /**
   * Format log entry for console output
   */
  static formatForConsole(entry: ILogEntry, useColors = true): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(8);
    const tag = entry.tag ? `[${entry.tag}]` : '';
    const message = entry.message;
    
    let formatted = `${timestamp} ${level} ${tag} ${message}`;
    
    if (useColors && typeof window === 'undefined') {
      // Node.js console colors
      const colors = {
        debug: '\x1b[90m',    // gray
        info: '\x1b[34m',     // blue
        warn: '\x1b[33m',     // yellow
        error: '\x1b[31m',    // red
        critical: '\x1b[41m', // red background
        reset: '\x1b[0m'
      };
      
      const color = colors[entry.level] || colors.info;
      formatted = `${color}${formatted}${colors.reset}`;
    }
    
    return formatted;
  }

  /**
   * Format log entry for file output
   */
  static formatForFile(entry: ILogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase();
    const tag = entry.tag || 'GENERAL';
    const message = entry.message;
    
    let formatted = `${timestamp} [${level}] [${tag}] ${message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.metadata) {
      formatted += ` | Metadata: ${JSON.stringify(entry.metadata)}`;
    }
    
    return formatted;
  }

  /**
   * Format log entry for JSON output
   */
  static formatAsJson(entry: ILogEntry): string {
    return JSON.stringify(entry, null, 2);
  }

  /**
   * Format log entry for structured text
   */
  static formatStructured(entry: ILogEntry): string {
    const lines = [
      `Timestamp: ${entry.timestamp.toISOString()}`,
      `Level: ${entry.level.toUpperCase()}`,
      `Message: ${entry.message}`
    ];
    
    if (entry.tag) {
      lines.push(`Tag: ${entry.tag}`);
    }
    
    if (entry.source) {
      lines.push(`Source: ${entry.source}`);
    }
    
    if (entry.userId) {
      lines.push(`User ID: ${entry.userId}`);
    }
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      lines.push(`Context: ${JSON.stringify(entry.context, null, 2)}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Format duration in human readable format
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    
    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${minutes.toFixed(2)}m`;
    }
    
    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

/**
 * Log filtering utilities
 */
export class LogFilter {
  /**
   * Filter log entries by criteria
   */
  static filterEntries(entries: ILogEntry[], criteria: LogSearchCriteria): ILogEntry[] {
    let filtered = entries;
    
    // Filter by levels
    if (criteria.levels && criteria.levels.length > 0) {
      filtered = filtered.filter(entry => criteria.levels!.includes(entry.level));
    }
    
    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(entry => 
        entry.tag && criteria.tags!.includes(entry.tag)
      );
    }
    
    // Filter by date range
    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange;
      filtered = filtered.filter(entry => 
        entry.timestamp >= start && entry.timestamp <= end
      );
    }
    
    // Filter by message pattern
    if (criteria.messagePattern) {
      const pattern = typeof criteria.messagePattern === 'string' 
        ? new RegExp(criteria.messagePattern, 'i')
        : criteria.messagePattern;
      
      filtered = filtered.filter(entry => pattern.test(entry.message));
    }
    
    // Filter by user ID
    if (criteria.userId) {
      filtered = filtered.filter(entry => entry.userId === criteria.userId);
    }
    
    // Filter by session ID
    if (criteria.sessionId) {
      filtered = filtered.filter(entry => entry.sessionId === criteria.sessionId);
    }
    
    // Apply limit and offset
    const startIndex = criteria.offset || 0;
    const endIndex = criteria.limit ? startIndex + criteria.limit : undefined;
    
    return filtered.slice(startIndex, endIndex);
  }

  /**
   * Create filter function from criteria
   */
  static createFilter(criteria: LogSearchCriteria): (entry: ILogEntry) => boolean {
    return (entry: ILogEntry) => {
      return this.filterEntries([entry], criteria).length > 0;
    };
  }

  /**
   * Filter entries by performance threshold
   */
  static filterByPerformance(
    entries: ILogEntry[], 
    thresholdMs: number
  ): ILogEntry[] {
    return entries.filter(entry => {
      const duration = entry.metadata?.duration;
      return duration !== undefined && duration > thresholdMs;
    });
  }

  /**
   * Filter entries by error patterns
   */
  static filterErrors(entries: ILogEntry[]): ILogEntry[] {
    return entries.filter(entry => 
      entry.level === 'error' || entry.level === 'critical'
    );
  }

  /**
   * Filter entries by user activity
   */
  static filterUserActivity(entries: ILogEntry[], userId: string): ILogEntry[] {
    return entries.filter(entry => entry.userId === userId);
  }
}

/**
 * Log analytics utilities
 */
export class LogAnalyzer {
  /**
   * Analyze log entries and generate metrics
   */
  static analyzeEntries(entries: ILogEntry[]): LogAnalytics {
    const totalLogs = entries.length;
    
    // Count by level
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0, info: 0, warn: 0, error: 0, critical: 0
    };
    
    // Count by tag
    const logsByTag: Record<string, number> = {};
    
    // Track error patterns
    const errorMessages: Record<string, { count: number; lastOccurred: Date }> = {};
    
    // Track response times
    const responseTimes: number[] = [];
    
    entries.forEach(entry => {
      // Level counts
      logsByLevel[entry.level]++;
      
      // Tag counts
      if (entry.tag) {
        logsByTag[entry.tag] = (logsByTag[entry.tag] || 0) + 1;
      }
      
      // Error tracking
      if (entry.level === 'error' || entry.level === 'critical') {
        const key = entry.message;
        if (!errorMessages[key]) {
          errorMessages[key] = { count: 0, lastOccurred: entry.timestamp };
        }
        errorMessages[key].count++;
        if (entry.timestamp > errorMessages[key].lastOccurred) {
          errorMessages[key].lastOccurred = entry.timestamp;
        }
      }
      
      // Response time tracking
      if (entry.metadata?.duration) {
        responseTimes.push(entry.metadata.duration);
      }
    });
    
    // Calculate error rate
    const errorCount = logsByLevel.error + logsByLevel.critical;
    const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;
    
    // Calculate average response time
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    // Top errors
    const topErrors = Object.entries(errorMessages)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastOccurred: data.lastOccurred
      }));
    
    // Log trends (simplified - would need time series data in real implementation)
    const logTrends = this.calculateTrends(entries);
    
    return {
      totalLogs,
      logsByLevel,
      logsByTag,
      errorRate,
      averageResponseTime,
      topErrors,
      logTrends
    };
  }

  /**
   * Calculate log trends over time
   */
  private static calculateTrends(entries: ILogEntry[]): LogAnalytics['logTrends'] {
    const trends: LogAnalytics['logTrends'] = [];
    
    // Group entries by date and level
    const grouped: Record<string, Record<LogLevel, number>> = {};
    
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { debug: 0, info: 0, warn: 0, error: 0, critical: 0 };
      }
      
      grouped[dateKey][entry.level]++;
    });
    
    // Convert to trend format
    Object.entries(grouped).forEach(([date, levels]) => {
      Object.entries(levels).forEach(([level, count]) => {
        if (count > 0) {
          trends.push({
            date: new Date(date),
            count,
            level: level as LogLevel
          });
        }
      });
    });
    
    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Detect anomalies in log patterns
   */
  static detectAnomalies(entries: ILogEntry[]): Array<{
    type: 'spike' | 'pattern' | 'performance';
    description: string;
    severity: 'low' | 'medium' | 'high';
    count: number;
    timeRange: { start: Date; end: Date };
  }> {
    const anomalies: Array<any> = [];
    
    // Detect error spikes
    const errorSpikes = this.detectErrorSpikes(entries);
    anomalies.push(...errorSpikes);
    
    // Detect performance issues
    const performanceIssues = this.detectPerformanceIssues(entries);
    anomalies.push(...performanceIssues);
    
    // Detect unusual patterns
    const patterns = this.detectUnusualPatterns(entries);
    anomalies.push(...patterns);
    
    return anomalies;
  }

  /**
   * Detect error spikes
   */
  private static detectErrorSpikes(entries: ILogEntry[]): Array<any> {
    // Simplified implementation - would need more sophisticated analysis
    const errors = entries.filter(e => e.level === 'error' || e.level === 'critical');
    const hourlyErrors: Record<string, number> = {};
    
    errors.forEach(error => {
      const hour = error.timestamp.toISOString().substring(0, 13);
      hourlyErrors[hour] = (hourlyErrors[hour] || 0) + 1;
    });
    
    const spikes = Object.entries(hourlyErrors)
      .filter(([_, count]) => count > 10) // threshold
      .map(([hour, count]) => ({
        type: 'spike' as const,
        description: `High error rate: ${count} errors in 1 hour`,
        severity: count > 50 ? 'high' as const : 'medium' as const,
        count,
        timeRange: {
          start: new Date(hour + ':00:00'),
          end: new Date(hour + ':59:59')
        }
      }));
    
    return spikes;
  }

  /**
   * Detect performance issues
   */
  private static detectPerformanceIssues(entries: ILogEntry[]): Array<any> {
    const slowRequests = entries.filter(entry => 
      entry.metadata?.duration && entry.metadata.duration > 5000 // 5 seconds
    );
    
    if (slowRequests.length > 5) {
      return [{
        type: 'performance' as const,
        description: `${slowRequests.length} slow requests detected`,
        severity: 'medium' as const,
        count: slowRequests.length,
        timeRange: {
          start: slowRequests[0].timestamp,
          end: slowRequests[slowRequests.length - 1].timestamp
        }
      }];
    }
    
    return [];
  }

  /**
   * Detect unusual patterns
   */
  private static detectUnusualPatterns(entries: ILogEntry[]): Array<any> {
    // Detect repeated identical messages
    const messageCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      messageCounts[entry.message] = (messageCounts[entry.message] || 0) + 1;
    });
    
    const repeatedMessages = Object.entries(messageCounts)
      .filter(([_, count]) => count > 100) // threshold
      .map(([message, count]) => ({
        type: 'pattern' as const,
        description: `Repeated message: "${message}" occurred ${count} times`,
        severity: 'low' as const,
        count,
        timeRange: {
          start: entries[0].timestamp,
          end: entries[entries.length - 1].timestamp
        }
      }));
    
    return repeatedMessages;
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(entries: ILogEntry[]): {
    slowestOperations: Array<{ operation: string; avgDuration: number; count: number }>;
    errorHotspots: Array<{ tag: string; errorCount: number; errorRate: number }>;
    userImpact: { affectedUsers: number; totalUsers: number; percentage: number };
  } {
    // Analyze slow operations
    const operations: Record<string, { durations: number[]; count: number }> = {};
    
    entries.forEach(entry => {
      if (entry.tag && entry.metadata?.duration) {
        if (!operations[entry.tag]) {
          operations[entry.tag] = { durations: [], count: 0 };
        }
        operations[entry.tag].durations.push(entry.metadata.duration);
        operations[entry.tag].count++;
      }
    });
    
    const slowestOperations = Object.entries(operations)
      .map(([operation, data]) => ({
        operation,
        avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
        count: data.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);
    
    // Analyze error hotspots
    const tagErrors: Record<string, { total: number; errors: number }> = {};
    
    entries.forEach(entry => {
      if (entry.tag) {
        if (!tagErrors[entry.tag]) {
          tagErrors[entry.tag] = { total: 0, errors: 0 };
        }
        tagErrors[entry.tag].total++;
        if (entry.level === 'error' || entry.level === 'critical') {
          tagErrors[entry.tag].errors++;
        }
      }
    });
    
    const errorHotspots = Object.entries(tagErrors)
      .filter(([_, data]) => data.errors > 0)
      .map(([tag, data]) => ({
        tag,
        errorCount: data.errors,
        errorRate: (data.errors / data.total) * 100
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
    
    // Calculate user impact
    const allUsers = new Set(entries.map(e => e.userId).filter(Boolean));
    const errorAffectedUsers = new Set(
      entries
        .filter(e => (e.level === 'error' || e.level === 'critical') && e.userId)
        .map(e => e.userId)
    );
    
    const userImpact = {
      affectedUsers: errorAffectedUsers.size,
      totalUsers: allUsers.size,
      percentage: allUsers.size > 0 ? (errorAffectedUsers.size / allUsers.size) * 100 : 0
    };
    
    return {
      slowestOperations,
      errorHotspots,
      userImpact
    };
  }
}

/**
 * Log storage utilities
 */
export class LogStorage {
  /**
   * Save logs to local storage (browser only)
   */
  static saveToLocalStorage(entries: ILogEntry[], key = 'game_logs'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = this.loadFromLocalStorage(key);
      const combined = [...existing, ...entries];
      
      // Keep only recent logs to prevent storage overflow
      const recent = combined.slice(-1000);
      
      localStorage.setItem(key, JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Load logs from local storage
   */
  static loadFromLocalStorage(key = 'game_logs'): ILogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear logs from local storage
   */
  static clearLocalStorage(key = 'game_logs'): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear logs from localStorage:', error);
    }
  }

  /**
   * Export logs as downloadable file
   */
  static exportLogs(entries: ILogEntry[], format: 'json' | 'csv' | 'txt' = 'json'): void {
    if (typeof window === 'undefined') return;
    
    let content: string;
    let mimeType: string;
    let extension: string;
    
    switch (format) {
      case 'csv':
        content = this.convertToCSV(entries);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'txt':
        content = entries.map(LogFormatter.formatForFile).join('\n');
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        content = JSON.stringify(entries, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `game_logs_${new Date().toISOString().split('T')[0]}.${extension}`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Convert log entries to CSV format
   */
  private static convertToCSV(entries: ILogEntry[]): string {
    const headers = ['Timestamp', 'Level', 'Tag', 'Message', 'User ID', 'Context'];
    const rows = entries.map(entry => [
      entry.timestamp.toISOString(),
      entry.level,
      entry.tag || '',
      entry.message.replace(/"/g, '""'), // Escape quotes
      entry.userId || '',
      JSON.stringify(entry.context || {}).replace(/"/g, '""')
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

/**
 * Log tag constants
 */
export const LogTags = {
  // Auth operations
  AUTH: {
    LOGIN: "LOGIN",
    REGISTER: "REGISTER", 
    LOGOUT: "LOGOUT",
    TOKEN_REFRESH: "TOKEN_REFRESH",
    PASSWORD_RESET: "PASSWORD_RESET",
    SIGNUP: "SIGNUP",
    MFA: "MFA",
    SESSION: "SESSION"
  },

  // Game operations  
  GAMES: {
    WORD_GUESS: "WORD_GUESS",
    WORD_SCRAMBLE: "WORD_SCRAMBLE",
    WORD_BUILDER: "WORD_BUILDER", 
    HANGMAN: "HANGMAN",
    MEMORY_CARD: "MEMORY_CARD",
    MATH_QUIZ: "MATH_QUIZ",
    TYPING_TEST: "TYPING_TEST",
    QUIZ: "QUIZ",
    EMOJI_GUESS: "EMOJI_GUESS",
    WHACK_MOLE: "WHACK_MOLE",
    SIMON_SAYS: "SIMON_SAYS",
    TIC_TAC_TOE: "TIC_TAC_TOE", 
    GAME_2048: "GAME_2048",
    REACTION_TIME: "REACTION_TIME",
    SLIDING_PUZZLE: "SLIDING_PUZZLE",
    SUDOKU: "SUDOKU",
    TOWER_STACKER: "TOWER_STACKER",
    SPEED_MATH: "SPEED_MATH",
    BRAIN_TEASER: "BRAIN_TEASER",
    CODING_PUZZLE: "CODING_PUZZLE",
    NUMBER_MAZE: "NUMBER_MAZE",
    MUSIC_TILES: "MUSIC_TILES",
    PIXEL_ART_CREATOR: "PIXEL_ART_CREATOR"
  },

  // Score operations
  SCORES: {
    SAVE: "SAVE_SCORE",
    FETCH: "FETCH_SCORES", 
    LEADERBOARD: "LEADERBOARD",
    MY_SCORES: "MY_SCORES",
    ANALYTICS: "SCORE_ANALYTICS"
  },

  // Progress operations
  PROGRESS: {
    FETCH: "FETCH_PROGRESS",
    UPDATE: "UPDATE_PROGRESS",
    ACHIEVEMENTS: "ACHIEVEMENTS", 
    ANALYTICS: "PROGRESS_ANALYTICS"
  },

  // API operations
  API: {
    REQUEST: "API_REQUEST",
    RESPONSE: "API_RESPONSE",
    ERROR: "API_ERROR",
    TIMEOUT: "API_TIMEOUT",
    RETRY: "API_RETRY"
  },

  // System operations
  SYSTEM: {
    STARTUP: "SYSTEM_STARTUP",
    SHUTDOWN: "SYSTEM_SHUTDOWN", 
    ERROR_HANDLING: "ERROR_HANDLING",
    PERFORMANCE: "PERFORMANCE",
    MEMORY: "MEMORY_USAGE",
    CACHE: "CACHE_OPERATION"
  },

  // UI operations
  UI: {
    NAVIGATION: "NAVIGATION",
    COMPONENT_MOUNT: "COMPONENT_MOUNT",
    COMPONENT_UNMOUNT: "COMPONENT_UNMOUNT",
    USER_ACTION: "USER_ACTION",
    ANIMATION: "ANIMATION"
  }
} as const;

/**
 * Export all utilities as a combined object
 */
export const LoggerUtils = {
  Level: LogLevelUtils,
  Formatter: LogFormatter,
  Filter: LogFilter,
  Analyzer: LogAnalyzer,
  Storage: LogStorage,
  Tags: LogTags
};
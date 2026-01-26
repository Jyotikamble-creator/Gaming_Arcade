// Error handling utility functions and helpers

import type {
  IBaseError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  ErrorHandlerConfig,
  ErrorMetrics,
  ErrorFilter,
  ErrorReport,
  ErrorBreadcrumb,
  ErrorNotification,
  HTTP_STATUS_CODES
} from "@/types/errors/errors";

/**
 * Error classification utilities
 */
export class ErrorClassifier {
  /**
   * Classify error severity based on various factors
   */
  static classifySeverity(error: Error | IBaseError, context?: ErrorContext): ErrorSeverity {
    // If already classified, use existing severity
    if ('severity' in error) {
      return error.severity;
    }

    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical patterns
    if (
      message.includes('segmentation fault') ||
      message.includes('out of memory') ||
      message.includes('database connection failed') ||
      message.includes('authentication service unavailable')
    ) {
      return 'critical';
    }

    // High severity patterns
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('payment') ||
      message.includes('security') ||
      stack.includes('security')
    ) {
      return 'high';
    }

    // Low severity patterns
    if (
      message.includes('validation') ||
      message.includes('required field') ||
      message.includes('invalid format') ||
      message.includes('not found')
    ) {
      return 'low';
    }

    // Context-based severity
    if (context?.environment === 'production') {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Determine error category from error properties
   */
  static determineCategory(error: Error | IBaseError): ErrorCategory {
    // If already categorized, use existing category
    if ('category' in error) {
      return error.category;
    }

    const message = error.message.toLowerCase();
    const name = error.name?.toLowerCase() || '';

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('login') ||
      message.includes('token expired') ||
      name.includes('auth')
    ) {
      return 'authentication';
    }

    // Authorization errors
    if (
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('access denied') ||
      message.includes('not allowed')
    ) {
      return 'authorization';
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format') ||
      name.includes('validation')
    ) {
      return 'validation';
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('request') ||
      name.includes('network')
    ) {
      return 'network';
    }

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      name.includes('timeout')
    ) {
      return 'timeout';
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('internal') ||
      message.includes('500') ||
      name.includes('server')
    ) {
      return 'server';
    }

    // Serialization errors
    if (
      message.includes('parse') ||
      message.includes('serialize') ||
      message.includes('json') ||
      message.includes('stringify')
    ) {
      return 'serialization';
    }

    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error | IBaseError): boolean {
    if ('retryable' in error && typeof error.retryable === 'boolean') {
      return error.retryable;
    }

    const category = this.determineCategory(error);
    const retryableCategories: ErrorCategory[] = [
      'network',
      'timeout',
      'server',
      'serialization'
    ];

    return retryableCategories.includes(category);
  }
}

/**
 * Error formatting utilities
 */
export class ErrorFormatter {
  /**
   * Format error for display to users
   */
  static formatForUser(error: IBaseError, showTechnicalDetails = false): string {
    const baseMessage = error.getUserMessage ? error.getUserMessage() : error.message;

    if (!showTechnicalDetails) {
      return baseMessage;
    }

    const details = [
      baseMessage,
      error.code ? `Code: ${error.code}` : null,
      `Category: ${error.category}`,
      `Time: ${error.timestamp.toLocaleString()}`
    ].filter(Boolean);

    return details.join('\n');
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: IBaseError, context?: ErrorContext): string {
    const lines = [
      `[${error.severity.toUpperCase()}] ${error.name}: ${error.message}`,
      `Category: ${error.category}`,
      `Timestamp: ${error.timestamp.toISOString()}`,
    ];

    if (error.code) {
      lines.push(`Code: ${error.code}`);
    }

    if (context) {
      lines.push(`User ID: ${context.userId || 'anonymous'}`);
      lines.push(`Session ID: ${context.sessionId || 'unknown'}`);
      lines.push(`Environment: ${context.environment}`);
      
      if (context.url) {
        lines.push(`URL: ${context.url}`);
      }
    }

    if (error.stack) {
      lines.push('Stack trace:');
      lines.push(error.stack);
    }

    return lines.join('\n');
  }

  /**
   * Format error for API responses
   */
  static formatForApi(error: IBaseError, includeStack = false): Record<string, any> {
    return {
      error: {
        name: error.name,
        message: error.message,
        category: error.category,
        severity: error.severity,
        code: error.code,
        timestamp: error.timestamp.toISOString(),
        ...(includeStack && error.stack && { stack: error.stack }),
        ...(error.metadata && { metadata: error.metadata })
      }
    };
  }

  /**
   * Create user-friendly error title
   */
  static createTitle(error: IBaseError): string {
    const titleMap: Record<ErrorCategory, string> = {
      authentication: 'Authentication Error',
      authorization: 'Access Denied',
      validation: 'Invalid Input',
      network: 'Connection Error',
      server: 'Server Error',
      client: 'Request Error',
      timeout: 'Request Timeout',
      serialization: 'Data Error',
      unknown: 'Unexpected Error'
    };

    return titleMap[error.category] || 'Error';
  }

  /**
   * Get error icon based on category
   */
  static getErrorIcon(error: IBaseError): string {
    const iconMap: Record<ErrorCategory, string> = {
      authentication: '🔐',
      authorization: '🚫',
      validation: '⚠️',
      network: '🌐',
      server: '🔥',
      client: '💻',
      timeout: '⏱️',
      serialization: '📄',
      unknown: '❓'
    };

    return iconMap[error.category] || '❓';
  }
}

/**
 * Error analytics utilities
 */
export class ErrorAnalyzer {
  /**
   * Analyze error patterns from a collection of errors
   */
  static analyzeErrorPatterns(errors: IBaseError[]): ErrorMetrics {
    const totalErrors = errors.length;
    
    // Count by category
    const errorsByCategory: Record<ErrorCategory, number> = {
      authentication: 0,
      authorization: 0,
      validation: 0,
      network: 0,
      server: 0,
      client: 0,
      timeout: 0,
      serialization: 0,
      unknown: 0
    };

    // Count by severity
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    // Count by HTTP status (if available)
    const errorsByStatus: Record<number, number> = {};

    // Track most common errors
    const errorCounts: Record<string, { count: number; lastOccurred: Date }> = {};

    errors.forEach(error => {
      // Category counts
      errorsByCategory[error.category]++;

      // Severity counts
      errorsBySeverity[error.severity]++;

      // Status code counts (if HTTP error)
      if ('httpDetails' in error && typeof error.httpDetails === 'object' && error.httpDetails.status) {
        const status = (error.httpDetails as any).status;
        errorsByStatus[status] = (errorsByStatus[status] || 0) + 1;
      }

      // Common error tracking
      const errorKey = `${error.name}: ${error.message}`;
      if (!errorCounts[errorKey]) {
        errorCounts[errorKey] = { count: 0, lastOccurred: error.timestamp };
      }
      errorCounts[errorKey].count++;
      if (error.timestamp > errorCounts[errorKey].lastOccurred) {
        errorCounts[errorKey].lastOccurred = error.timestamp;
      }
    });

    // Get most common errors (top 10)
    const mostCommonErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastOccurred: data.lastOccurred
      }));

    // Calculate trends (simplified - would need time series data in real implementation)
    const trends = this.calculateErrorTrends(errors);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByStatus,
      averageResolutionTime: 0, // Would need resolution data
      retrySuccessRate: 0, // Would need retry tracking
      mostCommonErrors,
      trends
    };
  }

  /**
   * Calculate error trends over time
   */
  private static calculateErrorTrends(errors: IBaseError[]): ErrorMetrics['trends'] {
    const trends: ErrorMetrics['trends'] = [];
    
    // Group errors by date and category
    const errorsByDate: Record<string, Record<ErrorCategory, number>> = {};
    
    errors.forEach(error => {
      const dateKey = error.timestamp.toISOString().split('T')[0];
      
      if (!errorsByDate[dateKey]) {
        errorsByDate[dateKey] = {
          authentication: 0,
          authorization: 0,
          validation: 0,
          network: 0,
          server: 0,
          client: 0,
          timeout: 0,
          serialization: 0,
          unknown: 0
        };
      }
      
      errorsByDate[dateKey][error.category]++;
    });

    // Convert to trend format
    Object.entries(errorsByDate).forEach(([date, categories]) => {
      Object.entries(categories).forEach(([category, count]) => {
        if (count > 0) {
          trends.push({
            date: new Date(date),
            count,
            category: category as ErrorCategory
          });
        }
      });
    });

    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Find error correlations
   */
  static findErrorCorrelations(errors: IBaseError[]): Array<{
    pattern: string;
    frequency: number;
    relatedErrors: string[];
  }> {
    // Simplified correlation analysis
    const patterns: Record<string, { count: number; relatedErrors: Set<string> }> = {};

    errors.forEach(error => {
      const pattern = `${error.category}_${error.severity}`;
      
      if (!patterns[pattern]) {
        patterns[pattern] = { count: 0, relatedErrors: new Set() };
      }
      
      patterns[pattern].count++;
      patterns[pattern].relatedErrors.add(error.message);
    });

    return Object.entries(patterns).map(([pattern, data]) => ({
      pattern,
      frequency: data.count,
      relatedErrors: Array.from(data.relatedErrors).slice(0, 5) // Top 5 related errors
    }));
  }

  /**
   * Detect error spikes
   */
  static detectErrorSpikes(errors: IBaseError[], threshold = 10): Array<{
    date: Date;
    category: ErrorCategory;
    count: number;
    isSpike: boolean;
  }> {
    const dailyCounts: Record<string, Record<ErrorCategory, number>> = {};

    errors.forEach(error => {
      const dateKey = error.timestamp.toISOString().split('T')[0];
      
      if (!dailyCounts[dateKey]) {
        dailyCounts[dateKey] = {
          authentication: 0, authorization: 0, validation: 0,
          network: 0, server: 0, client: 0, timeout: 0,
          serialization: 0, unknown: 0
        };
      }
      
      dailyCounts[dateKey][error.category]++;
    });

    const results: Array<{ date: Date; category: ErrorCategory; count: number; isSpike: boolean }> = [];

    Object.entries(dailyCounts).forEach(([date, categories]) => {
      Object.entries(categories).forEach(([category, count]) => {
        results.push({
          date: new Date(date),
          category: category as ErrorCategory,
          count,
          isSpike: count >= threshold
        });
      });
    });

    return results.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

/**
 * Error recovery utilities
 */
export class ErrorRecovery {
  /**
   * Attempt to recover from an error with various strategies
   */
  static async attemptRecovery(
    error: IBaseError,
    operation: () => Promise<any>,
    maxAttempts = 3
  ): Promise<{ success: boolean; result?: any; attempts: number; finalError?: Error }> {
    let attempts = 0;
    let lastError: Error = new Error(error.message);

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await operation();
        return { success: true, result, attempts };
      } catch (err) {
        lastError = err as Error;
        
        // Determine if should retry based on error type
        if (!ErrorClassifier.isRetryable(error) || attempts >= maxAttempts) {
          break;
        }

        // Calculate delay before retry
        const delay = this.calculateBackoffDelay(attempts);
        await this.sleep(delay);
      }
    }

    return { success: false, attempts, finalError: lastError };
  }

  /**
   * Calculate exponential backoff delay
   */
  private static calculateBackoffDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
    const delay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
  }

  /**
   * Sleep utility for delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create circuit breaker for error-prone operations
   */
  static createCircuitBreaker(
    operation: () => Promise<any>,
    options: {
      failureThreshold: number;
      resetTimeout: number;
      monitorTimeout: number;
    } = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitorTimeout: 30000
    }
  ) {
    let failureCount = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';
    let nextAttemptTime = 0;

    return async (...args: any[]) => {
      const now = Date.now();

      // If circuit is open and timeout hasn't passed
      if (state === 'open' && now < nextAttemptTime) {
        throw new Error('Circuit breaker is open');
      }

      // If circuit is open and timeout has passed, go to half-open
      if (state === 'open' && now >= nextAttemptTime) {
        state = 'half-open';
      }

      try {
        const result = await operation(...args);
        
        // Success - reset circuit breaker
        if (state === 'half-open' || failureCount > 0) {
          failureCount = 0;
          state = 'closed';
        }
        
        return result;
      } catch (error) {
        failureCount++;

        // If threshold reached, open circuit
        if (failureCount >= options.failureThreshold) {
          state = 'open';
          nextAttemptTime = now + options.resetTimeout;
        } else if (state === 'half-open') {
          // If half-open fails, go back to open
          state = 'open';
          nextAttemptTime = now + options.resetTimeout;
        }

        throw error;
      }
    };
  }
}

/**
 * Error reporting utilities
 */
export class ErrorReporter {
  /**
   * Create error report
   */
  static createReport(
    error: IBaseError,
    context: ErrorContext,
    breadcrumbs: ErrorBreadcrumb[] = []
  ): ErrorReport {
    return {
      id: this.generateReportId(),
      error,
      context,
      stackTrace: error.stack,
      breadcrumbs,
      resolved: false,
      reportedAt: new Date(),
      tags: this.generateTags(error, context)
    };
  }

  /**
   * Generate unique report ID
   */
  private static generateReportId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate tags for error categorization
   */
  private static generateTags(error: IBaseError, context: ErrorContext): string[] {
    const tags = [
      error.category,
      error.severity,
      context.environment
    ];

    if (error.code) {
      tags.push(error.code);
    }

    if (context.feature) {
      tags.push(`feature:${context.feature}`);
    }

    if (context.action) {
      tags.push(`action:${context.action}`);
    }

    return tags.filter(Boolean);
  }

  /**
   * Filter errors based on criteria
   */
  static filterErrors(errors: ErrorReport[], filter: ErrorFilter): ErrorReport[] {
    return errors.filter(report => {
      // Category filter
      if (filter.categories && !filter.categories.includes(report.error.category)) {
        return false;
      }

      // Severity filter
      if (filter.severities && !filter.severities.includes(report.error.severity)) {
        return false;
      }

      // Date range filter
      if (filter.dateRange) {
        const reportDate = report.reportedAt;
        if (reportDate < filter.dateRange.start || reportDate > filter.dateRange.end) {
          return false;
        }
      }

      // User filter
      if (filter.userId && report.context.userId !== filter.userId) {
        return false;
      }

      // Resolved filter
      if (filter.resolved !== undefined && report.resolved !== filter.resolved) {
        return false;
      }

      // Status code filter (for HTTP errors)
      if (filter.statusCodes && 'httpDetails' in report.error) {
        const status = (report.error as any).httpDetails?.status;
        if (status && !filter.statusCodes.includes(status)) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const messageMatch = report.error.message.toLowerCase().includes(searchLower);
        const contextMatch = JSON.stringify(report.context).toLowerCase().includes(searchLower);
        
        if (!messageMatch && !contextMatch) {
          return false;
        }
      }

      return true;
    });
  }
}

/**
 * Export all utilities as a combined object
 */
export const ErrorUtils = {
  Classifier: ErrorClassifier,
  Formatter: ErrorFormatter,
  Analyzer: ErrorAnalyzer,
  Recovery: ErrorRecovery,
  Reporter: ErrorReporter
};
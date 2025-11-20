export class ClientRequestError extends Error {
  constructor(message, status, statusText, response) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.name = "ClientRequestError";
    Object.setPrototypeOf(this, ClientRequestError.prototype);
  }
}

export class ServerResponseError extends Error {
  constructor(message, status, statusText, response) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.name = "ServerResponseError";
    Object.setPrototypeOf(this, ServerResponseError.prototype);
  }
}

export class SerializationError extends Error {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
    this.name = "SerializationError";
    Object.setPrototypeOf(this, SerializationError.prototype);
  }
}

export class ConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConnectionError";
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export function categorizeAxiosError(err) {
  if (!err) return new Error("Unknown error");
  
  const e = err;
  
  if (e.isAxiosError) {
    if (e.code === "ECONNABORTED") {
      console.error('[ERROR] Timeout error:', e.message);
      return new TimeoutError(e.message || "Request timed out");
    }
    
    if (e.response) {
      const status = e.response.status;
      const statusText = e.response.statusText;
      const resp = e.response.data;
      
      if (typeof status === "number") {
        if (status >= 400 && status < 500) {
          console.error('[ERROR] Client request error:', { status, statusText, message: e.message });
          return new ClientRequestError(e.message || "Client error", status, statusText, resp);
        }
        if (status >= 500) {
          console.error('[ERROR] Server response error:', { status, statusText, message: e.message });
          return new ServerResponseError(e.message || "Server error", status, statusText, resp);
        }
      }
    } else if (e.request) {
      console.error('[ERROR] Connection error:', e.message);
      return new ConnectionError(e.message || "No response received");
    }
  }
  
  // fallback
  console.error('[ERROR] Unknown error:', err);
  return new Error(String(err));
}
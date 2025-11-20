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
      return new TimeoutError(e.message || "Request timed out");
    }
    
    if (e.response) {
      const status = e.response.status;
      const statusText = e.response.statusText;
      const resp = e.response.data;
      
      if (typeof status === "number") {
        if (status >= 400 && status < 500) {
          return new ClientRequestError(e.message || "Client error", status, statusText, resp);
        }
        if (status >= 500) {
          return new ServerResponseError(e.message || "Server error", status, statusText, resp);
        }
      }
    } else if (e.request) {
      return new ConnectionError(e.message || "No response received");
    }
  }
  
  // fallback
  return new Error(String(err));
}
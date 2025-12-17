// client-side error
// Custom error classes for handling different types of HTTP errors
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

// Server-side error
// Represents errors that occur on the server side (5xx status codes)
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

// Serialization/Deserialization error
// Represents errors that occur during data serialization or deserialization
export class SerializationError extends Error {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
    this.name = "SerializationError";
    Object.setPrototypeOf(this, SerializationError.prototype);
  }
}

// Connection error
// Represents errors that occur due to network issues or lack of response
export class ConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConnectionError";
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

// Timeout error
// Represents errors that occur when a request times out
export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

// categorizeAxiosError
// Categorize Axios errors based on their properties
export function categorizeAxiosError(err) {
  if (!err) return new Error("Unknown error");

  const e = err;

  // Axios error handling
  if (e.isAxiosError) {
    if (e.code === "ECONNABORTED") {
      console.error("[ERROR] Timeout error:", e.message);
      return new TimeoutError(e.message || "Request timed out");
    }

    // Response received from server
    if (e.response) {
      const status = e.response.status;
      const statusText = e.response.statusText;
      const resp = e.response.data;

      // Client-side error
      if (typeof status === "number") {
        if (status >= 400 && status < 500) {
          console.error("[ERROR] Client request error:", {
            status,
            statusText,
            message: e.message,
          });
          return new ClientRequestError(
            e.message || "Client error",
            status,
            statusText,
            resp
          );
        }
        if (status >= 500) {
          console.error("[ERROR] Server response error:", {
            status,
            statusText,
            message: e.message,
          });
          return new ServerResponseError(
            e.message || "Server error",
            status,
            statusText,
            resp
          );
        }
      }
    } else if (e.request) {
      console.error("[ERROR] Connection error:", e.message);
      return new ConnectionError(e.message || "No response received");
    }
  }

  // fallback
  console.error("[ERROR] Unknown error:", err);
  return new Error(String(err));
}

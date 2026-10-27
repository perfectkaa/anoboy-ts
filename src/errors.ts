export class AnoboyBaseError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('NETWORK_ERROR', message, details);
  }
}

export class TimeoutError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('TIMEOUT_ERROR', message, details);
  }
}

export class HttpError extends AnoboyBaseError {
  status: number;

  constructor(status: number, message: string, details?: unknown) {
    super('HTTP_ERROR', message, details);
    this.status = status;
  }
}

export class ParseError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('PARSE_ERROR', message, details);
  }
}

export class InvalidUrlError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('INVALID_URL_ERROR', message, details);
  }
}

export class NotFoundError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('NOT_FOUND_ERROR', message, details);
  }
}

export class RateLimitError extends AnoboyBaseError {
  constructor(message: string, details?: unknown) {
    super('RATE_LIMIT_ERROR', message, details);
  }
}
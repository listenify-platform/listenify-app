export interface JSONRPCRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: string | number;
}

export interface JSONRPCResponse {
  jsonrpc: string;
  result?: any;
  error?: JSONRPCError;
  id: string | number | null;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: any;
}

export interface WebSocketOptions {
  url: string;
  token?: string;
  autoReconnect: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  timeout: number;
  pingInterval: number;
  debug?: boolean;
}

export interface EventSubscription {
  unsubscribe: () => void;
}

export type EventHandler<T = any> = (data: T) => void;
export type ResponseHandler<T = any> = (error: JSONRPCError | null, result: T | null) => void;

export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

// Error codes from backend (from errors.go)
export enum ErrorCode {
  // Standard JSON-RPC 2.0 error codes
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_ERROR = -32000,
  
  // Authentication error codes
  AUTHENTICATION_REQUIRED = -32001,
  NOT_AUTHORIZED = -32002,
  RATE_LIMIT_EXCEEDED = -32003,
  INVALID_TOKEN = -32004,
  SESSION_EXPIRED = -32005,
  
  // Room error codes
  ROOM_NOT_FOUND = -32100,
  ROOM_FULL = -32101,
  ROOM_CLOSED = -32102,
  USER_NOT_IN_ROOM = -32103,
  USER_ALREADY_IN_ROOM = -32104,
  
  // Media error codes
  MEDIA_NOT_FOUND = -32200,
  MEDIA_UNAVAILABLE = -32201,
  
  // Playlist error codes
  PLAYLIST_NOT_FOUND = -32300,
  PLAYLIST_ITEM_NOT_FOUND = -32301,
  
  // User error codes
  USER_NOT_FOUND = -32400,
  USER_ALREADY_EXISTS = -32401
}
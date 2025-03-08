import { 
  type JSONRPCRequest, 
  type JSONRPCResponse, 
  type WebSocketOptions,
  type EventHandler,
  type EventSubscription,
  ConnectionState,
} from './types';

import { reactive, toRefs } from 'vue';

const WS_PROTOCOL: string = location.protocol === 'https:' ? 'wss:' : 'ws:';
const JSONRPC_VERSION: string = '2.0';

const DEFAULT_OPTIONS: WebSocketOptions = {
  url: '',
  token: '',
  debug: false,
  timeout: 5000,
  pingInterval: 1000,
  autoReconnect: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 6,
  reconnectionDelayMax: 30000,
};

export class JSONRPCService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private pendingRequests: Map<string | number, { 
    resolve: (value: any) => void; 
    reject: (reason: any) => void;
    timeout: number | null;
  }> = new Map();
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private requestId = 0;
  private reconnectAttempts = 0;
  
  private state = reactive({
    connectionState: ConnectionState.DISCONNECTED,
    connected: false,
    lastError: null as Error | null,
    reconnecting: false,
    options: { ...DEFAULT_OPTIONS } as WebSocketOptions
  });
  
  /**
   * Create a new WebSocket service instance
   * @param options WebSocket connection options
   */
  constructor(options: Partial<WebSocketOptions>) {
    // Merge provided options with defaults
    this.state.options = { ...DEFAULT_OPTIONS, ...options };

    // Include WSS protocol if not provided
    const protocols = ['ws:', 'wss:'];
    if (this.state.options.url && !protocols.includes(this.state.options.url.split(':')[0]))
      this.state.options.url = `${WS_PROTOCOL}//${this.state.options.url}`;
    
    // Connect automatically if autoReconnect is enabled
    if (this.state.options.autoReconnect && this.state.options.url)
      this.connect();
  }
  
  /**
   * Get reactive state properties
   */
  public getState() {
    return toRefs(this.state);
  }
  
  /**
   * Update connection options
   * @param options New options to apply
   */
  public setOptions(options: Partial<WebSocketOptions>): void {
    const wasConnected = this.state.connected;
    const urlChanged = options.url && options.url !== this.state.options.url;
    const tokenChanged = options.token && options.token !== this.state.options.token;
    
    Object.assign(this.state.options, options);
    
    // If URL or token changed and we were connected, reconnect
    if (wasConnected && (urlChanged || tokenChanged)) {
      this.disconnect().then(() => this.connect());
    }
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): Promise<void> {
    if (this.state.connectionState === ConnectionState.CONNECTING || 
        this.state.connectionState === ConnectionState.CONNECTED) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.state.options.url) {
        const error = new Error('WebSocket URL not set');
        this.state.lastError = error;
        reject(error);
        return;
      }
      
      this.state.connectionState = ConnectionState.CONNECTING;
      
      // Build URL with token if provided
      let url = this.state.options.url;
      if (this.state.options.token) {
        url = `${url}${url.includes('?') ? '&' : '?'}token=${this.state.options.token}`;
      }
      
      try {
        this.socket = new WebSocket(url);
        
        // Set up event handlers
        this.socket.onopen = () => this.handleOpen(resolve);
        this.socket.onmessage = (event) => this.handleMessage(event);
        this.socket.onclose = (event) => this.handleClose(event);
        this.socket.onerror = (event) => this.handleError(event, reject);
        
        // Set connection timeout
        setTimeout(() => {
          if (this.state.connectionState === ConnectionState.CONNECTING) {
            const error = new Error('Connection timeout');
            this.state.lastError = error;
            
            // Force close the socket if it's still connecting
            if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
              this.socket.close();
            }
            
            this.state.connectionState = ConnectionState.DISCONNECTED;
            reject(error);
          }
        }, this.state.options.timeout);
      } catch (error) {
        this.state.connectionState = ConnectionState.DISCONNECTED;
        this.state.lastError = error as Error;
        this.log('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.state.connectionState === ConnectionState.DISCONNECTED ||
          this.state.connectionState === ConnectionState.DISCONNECTING) {
        resolve();
        return;
      }
      
      this.state.connectionState = ConnectionState.DISCONNECTING;
      this.clearTimers();
      
      if (this.socket) {
        // Set up one-time close handler to resolve the promise
        const onClose = () => {
          if (this.socket) {
            this.socket.removeEventListener('close', onClose);
          }
          this.state.connectionState = ConnectionState.DISCONNECTED;
          this.state.connected = false;
          resolve();
        };
        
        // If socket is already closed, just resolve
        if (this.socket.readyState === WebSocket.CLOSED) {
          this.state.connectionState = ConnectionState.DISCONNECTED;
          this.state.connected = false;
          resolve();
          return;
        }
        
        // Add temporary close listener
        this.socket.addEventListener('close', onClose);
        
        // Close socket with code 1000 (normal closure)
        this.socket.close(1000, 'Client disconnect');
      } else {
        this.state.connectionState = ConnectionState.DISCONNECTED;
        this.state.connected = false;
        resolve();
      }
    });
  }
  
  /**
   * Subscribe to an event
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   * @returns Subscription object with unsubscribe method
   */
  public on<T = any>(eventType: string, handler: EventHandler<T>): EventSubscription {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    const handlers = this.eventHandlers.get(eventType)!;
    handlers.add(handler as EventHandler);
    
    return {
      unsubscribe: () => {
        if (this.eventHandlers.has(eventType)) {
          const handlers = this.eventHandlers.get(eventType)!;
          handlers.delete(handler as EventHandler);
          
          if (handlers.size === 0) {
            this.eventHandlers.delete(eventType);
          }
        }
      }
    };
  }
  
  /**
   * Subscribe to an event for a single occurrence
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   * @returns Subscription object with unsubscribe method
   */
  public once<T = any>(eventType: string, handler: EventHandler<T>): EventSubscription {
    const oneTimeHandler: EventHandler = (data: T) => {
      // Remove the handler after it's called
      subscription.unsubscribe();
      // Call the original handler
      handler(data);
    };
    
    const subscription = this.on(eventType, oneTimeHandler);
    return subscription;
  }
  
  /**
   * Remove all handlers for an event type
   * @param eventType Event type to unsubscribe from
   */
  public off(eventType: string): void {
    this.eventHandlers.delete(eventType);
  }
  
  /**
   * Send a JSON-RPC notification (no response expected)
   * @param method Method name
   * @param params Method parameters
   * @returns Promise that resolves when notification is sent
   */
  public notify(method: string, params?: any): Promise<void> {
    const request: JSONRPCRequest = {
      jsonrpc: JSONRPC_VERSION,
      method,
      params
    };
    
    return this.sendRequest(request);
  }
  
  /**
   * Send a JSON-RPC request and get a response
   * @param method Method name
   * @param params Method parameters
   * @param timeout Request timeout in ms (default: options.timeout)
   * @returns Promise that resolves with the result or rejects with an error
   */
  public call<T = any>(method: string, params?: any, timeout?: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = `${++this.requestId}`;
      
      const request: JSONRPCRequest = {
        jsonrpc: JSONRPC_VERSION,
        method,
        params,
        id
      };
      
      // Set timeout
      const timeoutDuration = timeout || this.state.options.timeout;
      const timeoutId = window.setTimeout(() => {
        const pendingRequest = this.pendingRequests.get(id);
        if (pendingRequest) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, timeoutDuration);
      
      // Store the pending request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: timeoutId
      });
      
      // Send the request
      this.sendRequest(request).catch((error) => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }
  
  /**
   * Send a raw JSON-RPC request
   * @param request JSON-RPC request object
   * @returns Promise that resolves when request is sent
   */
  private sendRequest(request: JSONRPCRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.state.connected && this.socket?.readyState === WebSocket.OPEN) {
        try {
          const message = JSON.stringify(request);
          this.socket.send(message);
          this.log('Request sent:', request);
          resolve();
        } catch (error) {
          this.log('Error sending request:', error);
          reject(error);
        }
      } else {
        // Not connected, attempt to connect
        if (this.state.connectionState === ConnectionState.DISCONNECTED && 
            this.state.options.autoReconnect) {
          this.connect()
            .then(() => {
              this.sendRequest(request).then(resolve).catch(reject);
            })
            .catch(reject);
        } else {
          reject(new Error('WebSocket is not connected'));
        }
      }
    });
  }
  
  /**
   * Handle WebSocket open event
   * @param resolveConnect Function to resolve the connect promise
   */
  private handleOpen(resolveConnect: () => void): void {
    this.state.connectionState = ConnectionState.CONNECTED;
    this.state.connected = true;
    this.state.lastError = null;
    this.reconnectAttempts = 0;
    
    // Set up ping interval for keep-alive
    this.startPingInterval();
    
    // Emit connect event
    this.emitEvent('socket:connect');
    
    this.log('WebSocket connected');
    resolveConnect();
  }
  
  /**
   * Handle WebSocket message event
   * @param event WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    this.log('Message received:', event.data);

    try {
      const data = JSON.parse(event.data) as JSONRPCResponse | JSONRPCRequest;
      
      // Handle response
      if ('id' in data && ((data as JSONRPCResponse).result !== undefined || (data as JSONRPCResponse).error !== undefined))
        this.handleResponse(data as JSONRPCResponse);
      else if ('method' in data)
        this.handleNotification(data as JSONRPCRequest);
    } catch (error) {
      this.log('Error parsing message:', error, event.data);
    }
  }
  
  /**
   * Handle JSON-RPC response
   * @param response JSON-RPC response
   */
  private handleResponse(response: JSONRPCResponse): void {
    const id = response.id;
    if (id === null) return;
    
    const pendingRequest = this.pendingRequests.get(id);
    if (pendingRequest) {
      // Clear timeout
      if (pendingRequest.timeout !== null) {
        clearTimeout(pendingRequest.timeout);
      }
      
      // Remove from pending requests
      this.pendingRequests.delete(id);
      
      // Handle error
      if (response.error) {
        pendingRequest.reject(response.error);
        return;
      }
      
      // Handle result
      pendingRequest.resolve(response.result);
    }
  }
  
  /**
   * Handle JSON-RPC notification (event)
   * @param notification JSON-RPC notification
   */
  private handleNotification(notification: JSONRPCRequest): void {
    const method = notification.method;
    this.emitEvent(method, notification.params);
  }
  
  /**
   * Handle WebSocket close event
   * @param event WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log('WebSocket closed:', event.code, event.reason);
    
    // Don't attempt to reconnect on normal closure
    const normalClosure = event.code === 1000;
    
    this.clearTimers();
    
    // Was this a clean disconnection initiated by the client?
    if (this.state.connectionState === ConnectionState.DISCONNECTING || normalClosure) {
      this.state.connectionState = ConnectionState.DISCONNECTED;
      this.state.connected = false;
      this.emitEvent('socket:disconnect', { 
        code: event.code, 
        reason: event.reason
      });
      return;
    }
    
    // Handle reconnection for unexpected closures
    this.state.connected = false;
    
    if (this.state.options.autoReconnect) {
      this.attemptReconnect();
    } else {
      this.state.connectionState = ConnectionState.DISCONNECTED;
      this.emitEvent('socket:disconnect', { 
        code: event.code, 
        reason: event.reason
      });
    }
  }
  
  /**
   * Handle WebSocket error event
   * @param event WebSocket error event
   * @param rejectConnect Function to reject the connect promise
   */
  private handleError(event: Event, rejectConnect?: (reason?: any) => void): void {
    const error = new Error('WebSocket error');
    this.state.lastError = error;
    this.log('WebSocket error:', event);
    
    this.emitEvent('socket:error', error);
    
    if (rejectConnect) {
      rejectConnect(error);
    }
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    // Don't attempt to reconnect if we're already reconnecting
    if (this.state.reconnecting) {
      return;
    }
    
    // Check if we've exceeded the maximum number of reconnection attempts
    if (this.reconnectAttempts >= this.state.options.reconnectionAttempts) {
      this.state.connectionState = ConnectionState.DISCONNECTED;
      this.state.reconnecting = false;
      this.emitEvent('socket:reconnect_failed');
      this.log('Maximum reconnection attempts reached');
      return;
    }
    
    // Update state
    this.state.connectionState = ConnectionState.RECONNECTING;
    this.state.reconnecting = true;
    this.reconnectAttempts++;
    
    // Calculate delay with exponential backoff
    const reconnectDelay = Math.min(
      this.state.options.reconnectionDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      this.state.options.reconnectionDelayMax
    );
    
    this.log(`Reconnecting in ${Math.round(reconnectDelay)}ms (attempt ${this.reconnectAttempts})`);
    
    // Emit reconnect attempt event
    this.emitEvent('socket:reconnect_attempt', { 
      attempt: this.reconnectAttempts,
      delay: reconnectDelay
    });
    
    // Set reconnection timer
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect()
        .then(() => {
          this.state.reconnecting = false;
          this.emitEvent('socket:reconnect_success', { 
            attempt: this.reconnectAttempts 
          });
        })
        .catch((error) => {
          this.state.lastError = error;
          this.emitEvent('socket:reconnect_error', error);
          this.attemptReconnect();
        });
    }, reconnectDelay);
  }
  
  /**
   * Start ping interval for keep-alive
   */
  private startPingInterval(): void {
    this.clearPingTimer();
    
    this.pingTimer = window.setInterval(() => {
      if (this.state.connected && this.socket?.readyState === WebSocket.OPEN) {
        // Send ping notification
        this.call('ping').catch((error) => {
          this.log('Failed to send ping:', error);
        });
      }
    }, this.state.options.pingInterval);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearPingTimer();
    this.clearReconnectTimer();
  }
  
  /**
   * Clear ping timer
   */
  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
  
  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Emit an event to all registered handlers
   * @param eventType Event type
   * @param data Event data
   */
  private emitEvent(eventType: string, data?: any): void {
    // Call handlers for this specific event type
    if (this.eventHandlers.has(eventType)) {
      const handlers = this.eventHandlers.get(eventType)!;
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log(`Error in handler for event ${eventType}:`, error);
        }
      });
    }
    
    // Call wildcard handlers for all events
    if (this.eventHandlers.has('*')) {
      const handlers = this.eventHandlers.get('*')!;
      handlers.forEach(handler => {
        try {
          handler({ type: eventType, data });
        } catch (error) {
          this.log(`Error in wildcard handler for event ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Log message if debug is enabled
   * @param message Log message
   * @param args Additional arguments
   */
  private log(message: string, ...args: any[]): void {
    if (this.state.options.debug) {
      const errorPrefixes = ['Error', 'Failed'];

      if (errorPrefixes.some(prefix => message.startsWith(prefix))) {
        console.error(`internal/rpc_service error: ${message}`, ...args);
      } else {
        console.log(`internal/rpc_service: ${message}`, ...args);
      }
    }
  }
}
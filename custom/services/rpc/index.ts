export * from './types';

import { JSONRPCService } from './service';

let _service: JSONRPCService | null = null;

/**
 * Initialize JSONRPC service
 * @param options JSONRPC options
 * @returns JSONRPC service instance
 */
export function initJSONRPCService(options: { 
  url: string, 
  token?: string, 
  debug?: boolean 
}) {
  if (!_service) {
    _service = new JSONRPCService({
      url: options.url,
      token: options.token,
      debug: options.debug || false,
      autoReconnect: true
    });
  } else {
    _service.setOptions(options);
  }
  
  return _service;
}

/**
 * Get JSONRPC service instance with retry mechanism
 * @param maxWaitTime Maximum time to wait in milliseconds (default: 10000ms)
 * @param checkInterval Interval between checks in milliseconds (default: 100ms)
 * @returns Promise that resolves to JSONRPC service instance
 */
export function getJSONRPCService(maxWaitTime = 10000, checkInterval = 100): Promise<JSONRPCService> {
  return new Promise((resolve, reject) => {
    // If service is already initialized, return it immediately
    if (_service) {
      return resolve(_service);
    }
    
    // Set a timeout to reject the promise if maxWaitTime is exceeded
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error('Timeout: JSONRPC service initialization timed out'));
    }, maxWaitTime);
    
    // Check periodically if the service is initialized
    const intervalId = setInterval(() => {
      if (_service) {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve(_service);
      }
    }, checkInterval);
  });
}

/**
 * Get JSONRPC service instance synchronously (for backward compatibility)
 * @returns JSONRPC service instance or null if not initialized
 * @throws Error if service is not initialized
 */
export function getJSONRPCServiceSync(): JSONRPCService {
  if (!_service)
    throw new Error('JSONRPC service is not initialized');

  return _service;
}
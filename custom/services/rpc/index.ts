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
 * Get JSONRPC service instance
 * @returns JSONRPC service instance
 */
export function getJSONRPCService(): JSONRPCService {
  if (!_service)
    throw new Error('JSONRPC service is not initialized');

  return _service!;
}
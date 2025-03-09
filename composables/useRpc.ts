import { computed } from 'vue';
import { ErrorCode, ConnectionState, getJSONRPCServiceSync } from '@/custom';

/**
 * Vue composable for JSONRPC functionality
 * @returns JSONRPC utilities and state
 */
export function useRpc() {
  const JSONRPCService = getJSONRPCServiceSync();
  const { connectionState, connected, lastError, reconnecting } = JSONRPCService.getState();
  
  // Derived state
  const isConnecting = computed(() => 
    connectionState.value === ConnectionState.CONNECTING
  );
  
  const isDisconnecting = computed(() => 
    connectionState.value === ConnectionState.DISCONNECTING
  );
  
  const isReconnecting = computed(() => 
    connectionState.value === ConnectionState.RECONNECTING
  );
  
  return {
    // Core methods
    connect: JSONRPCService.connect.bind(JSONRPCService),
    disconnect: JSONRPCService.disconnect.bind(JSONRPCService),
    call: JSONRPCService.call.bind(JSONRPCService),
    notify: JSONRPCService.notify.bind(JSONRPCService),
    on: JSONRPCService.on.bind(JSONRPCService),
    once: JSONRPCService.once.bind(JSONRPCService),
    off: JSONRPCService.off.bind(JSONRPCService),
    
    // State
    connectionState,
    connected,
    lastError,
    reconnecting,
    isConnecting,
    isDisconnecting,
    isReconnecting,
    
    // Constants
    ErrorCode
  };
}
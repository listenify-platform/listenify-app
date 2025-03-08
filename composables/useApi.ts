import { ApiError, apiModules } from '@/custom';

/**
 * Composable for handling API requests with loading and error states
 */
export function useApi() {
  const loading = ref(false);
  const error = ref<ApiError | null>(null);
  
  /**
   * Execute an API request with loading and error handling
   * @param apiCall Function that returns a Promise
   * @param options Additional options
   * @returns Promise with the API call result
   */
  async function execute<T>(
    apiCall: () => Promise<T>, 
    options: { 
      onSuccess?: (data: T) => void,
      onError?: (error: ApiError) => void,
      resetError?: boolean
    } = {}
  ): Promise<T> {
    if (options.resetError) {
      error.value = null;
    }
    
    loading.value = true;
    
    try {
      const result = await apiCall();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (e) {
      const apiError = e as ApiError;
      error.value = apiError;
      
      if (options.onError) {
        options.onError(apiError);
      }
      
      throw apiError;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    api: apiModules,
    error,
    execute,
    loading,
    hasError: computed(() => error.value !== null),
    isLoading: computed(() => loading.value),
    errorMessage: computed(() => error.value?.message || '')
  };
}
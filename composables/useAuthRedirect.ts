export function useAuthRedirect() {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  /**
   * Handle redirect after successful authentication
   */
  const handleSuccessfulAuth = () => {
    // Check if there's a redirect query parameter
    const redirectUrl = route.query.redirect as string | undefined;
    
    // Navigate to the redirect URL if available, otherwise to the app home
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  /**
   * Watch for authentication state changes
   */
  const setupAuthWatcher = () => {
    watch(
      () => userStore.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          // User has been authenticated (could happen from another component)
          handleSuccessfulAuth();
        }
      }
    );
  };

  return {
    handleSuccessfulAuth,
    setupAuthWatcher
  };
}
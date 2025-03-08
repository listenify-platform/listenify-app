export function useAuthRedirect() {
  const router = useRouter();
  const route = useRoute();

  /**
   * Handle redirect after successful authentication
  */
  const handleSuccessfulAuth = () => {
    const { isAuthenticated } = useUserStore();
    if (!isAuthenticated)
      return;

    // Check if there's a redirect query parameter
    const redirectUrl = route.query.redirect as string | undefined;

    // Navigate to the redirect URL if available, otherwise to the app home
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  return {
    handleSuccessfulAuth,
  };
}
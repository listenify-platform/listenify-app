export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware if route doesn't have any auth requirements
  if (!to.meta.requiresAuth && to.meta.allowWhenLoggedIn !== false) {
    return;
  }

  // Check if user is logged in
  const { isAuthenticated } = useUserStore();
  
  // Case 1: Route requires authentication and user is not logged in
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Add the current route path as a redirect query parameter
    return navigateTo({
      path: '/auth',
      query: { redirect: to.fullPath }
    });
  }
  
  // Case 2: Route doesn't allow logged in users but user is logged in
  if (to.meta.allowWhenLoggedIn === false && isAuthenticated) {
    // For this case we typically just redirect to home without a redirect parameter
    return navigateTo('/'); // Redirect to home page or dashboard
  }
});
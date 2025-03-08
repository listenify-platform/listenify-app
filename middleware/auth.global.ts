export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware if route doesn't have any auth requirements
  if (!to.meta.requiresAuth && to.meta.allowWhenLoggedIn !== false) {
    return;
  }
  
  // Check if user is logged in (using localStorage for this example)
  const userStorage = useCookie('user-token');
  const isLoggedIn = !!userStorage.value;
  
  // Case 1: Route requires authentication and user is not logged in
  if (to.meta.requiresAuth && !isLoggedIn) {
    return navigateTo('/auth');
  }
  
  // Case 2: Route doesn't allow logged in users but user is logged in
  if (to.meta.allowWhenLoggedIn === false && isLoggedIn) {
    return navigateTo('/'); // Redirect to home page or dashboard
  }
});
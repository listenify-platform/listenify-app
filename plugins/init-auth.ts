import { userStorage } from "~/custom";

const IGNORE_PATHS = [
  '/', // home
  '/auth', // auth page
];

export default defineNuxtPlugin(() => {
  const userStore = useUserStore();
  const router = useRouter();
  const route = useRoute();
  
  // Watch the authentication state
  watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        // Check if there's a redirect query parameter
        if (route.query.redirect) {
          console.log('got redirect', route.query);
          return router.push(route.query.redirect as string);
        }
        
        // Check if there's a saved path in localStorage from a previous session
        const savedPath = userStorage.has('last_path') ? userStorage.get('last_path') : undefined;
        if (savedPath && !IGNORE_PATHS.includes(savedPath)) {
          console.log('returning to saved path', savedPath);
          userStorage.set('last_path', null); // Clear it after use
          return router.push(savedPath);
        }

        console.log('no redirect or saved path, pushing to home');
        return router.push('/');
      }
    },
    { immediate: true }
  );
  
  // Save the current path when user navigates
  router.afterEach((to) => {
    if (userStore.isAuthenticated && !IGNORE_PATHS.includes(to.path)) {
      userStorage.set('last_path', to.path);
    }
  });
});
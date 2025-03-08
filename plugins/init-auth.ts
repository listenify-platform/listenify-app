export default defineNuxtPlugin(() => {
  const userStore = useUserStore();
  const router = useRouter();
  const route = useRoute();
  
  // Watch the authentication state
  watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        if (route.query.redirect)
          return router.push(route.query.redirect as string);
  
        return router.push('/');
      }
    },
    { immediate: true }
  );
});
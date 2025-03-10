import { _getAppConfig } from '#app';
import { useApi } from '@/composables/useApi';
import { type API, type Users, userStorage, useInitializableStore, initJSONRPCService } from '@/custom';

export const useUserStore = useInitializableStore(defineStore('user', () => {
  const config = _getAppConfig();
  const { api, execute } = useApi();

  // Define reactive state using composition API style
  const state = reactive<Users.PersonalState>({
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false
  });

  // Computed properties (getters)
  const friends = computed(() => state.user?.connections?.friends || []);
  const blocked = computed(() => state.user?.connections?.blocked || []);
  const userInfo = computed(() => state.user || {});
  const settings = computed(() => state.user?.settings || {});
  const followers = computed(() => state.user?.connections?.followers || []);
  const following = computed(() => state.user?.connections?.following || []);
  const favorites = computed(() => state.user?.connections?.favorites || []);
  const accessToken = computed(() => state.token || null);

  // Optional: Role-based computed properties
  const isAdmin = computed(() => state.user?.roles?.includes('admin') || false);
  const isModerator = computed(() => state.user?.roles?.includes('moderator') || false);

  // Initialize the store
  async function initialize() {
    const token = userStorage.has('access_token') ? userStorage.get('access_token') : null;

    if (!state.isAuthenticated && token !== null) {
      // if token is not a string, do not attempt to fetch user
      if (typeof token !== 'string')
        return;

      state.loading = true;

      await execute<Users.User>(
        () => api.auth.getCurrentUser(),
        {
          onError: () => {
            state.loading = false;
            state.isAuthenticated = false;
            userStorage.set('access_token', null);
          },
          onSuccess: (user) => {
            state.user = user;
            state.token = token;
            state.loading = false;
            state.isAuthenticated = true;

            initJSONRPCService({ url: config.WS_URL, token, debug: !config.IS_PRODUCTION });
          }
        }
      );
    }
  }

  async function login(data: API.LoginRequest) {
    if (state.loading || state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<API.LoginResponse>(
      () => api.auth.login(data),
      {
        onError: () => {
          state.loading = false;
          state.isAuthenticated = false;
        },
        onSuccess: (response) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = response.user;
          state.token = response.token;
          userStorage.set('access_token', response.token);

          initJSONRPCService({ url: config.WS_URL, token: response.token, debug: !config.IS_PRODUCTION });
        }
      }
    );
  }

  async function register(data: API.RegisterRequest) {
    if (state.loading || state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<API.RegisterResponse>(
      () => api.auth.register(data),
      {
        onError: () => {
          state.loading = false;
          state.isAuthenticated = false;
        },
        onSuccess: (response) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = response.user;
          state.token = response.token;
          userStorage.set('access_token', response.token);

          initJSONRPCService({ url: config.WS_URL, token: response.token, debug: !config.IS_PRODUCTION });
        }
      }
    );
  }

  async function logout() {
    if (state.loading || !state.isAuthenticated)
      return;

    state.loading = true;

    return await execute(
      () => api.auth.logout(),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: () => {
          state.user = null;
          state.token = null;
          state.loading = false;
          state.isAuthenticated = false;
          userStorage.set('access_token', null);
        }
      }
    );
  }

  async function updateProfile(profileData: API.UserUpdateRequest) {
    if (state.loading || !state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.User>(
      () => api.user.updateUser(profileData),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (updatedUser) => {
          state.loading = false;
          state.user = updatedUser;
        }
      }
    );
  }

  async function changePassword(passwordData: API.PasswordChangeRequest) {
    if (state.loading || !state.isAuthenticated)
      return;

    state.loading = true;

    return await execute(
      () => api.user.changePassword(passwordData),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: () => {
          state.loading = false;
        }
      }
    );
  }

  async function refreshToken() {
    if (!state.isAuthenticated)
      return;

    return await execute<API.RefreshResponse>(
      () => api.auth.refreshToken(),
      {
        onError: () => {
          // Token refresh failed - user needs to log in again
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          userStorage.set('access_token', null);
        },
        onSuccess: (response) => {
          state.token = response.token;
          userStorage.set('access_token', response.token);
        }
      }
    );
  }

  async function getUser(userId: string) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.Public>(
      () => api.user.getUser(userId),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (user) => {
          state.loading = false;
          return user;
        }
      }
    );
  }

  async function searchUsers(query: string, page: number = 1, limit: number = 20) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.Public[]>(
      () => api.user.searchUsers(query, page, limit),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (users) => {
          state.loading = false;
          return users;
        }
      }
    );
  }

  async function getOnlineUsers() {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.Public[]>(
      () => api.user.getOnlineUsers(),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (users) => {
          state.loading = false;
          return users;
        }
      }
    );
  }

  async function getFollowing(page: number = 1, limit: number = 20) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.Public[]>(
      () => api.user.getFollowing(page, limit),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (users) => {
          state.loading = false;
          if (state.user) {
            state.user.connections = {
              ...state.user.connections,
              following: users.map(user => user.id)
            };
          }
          return users;
        }
      }
    );
  }

  async function getFollowers(page: number = 1, limit: number = 20) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<Users.Public[]>(
      () => api.user.getFollowers(page, limit),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: (users) => {
          state.loading = false;
          if (state.user) {
            state.user.connections = {
              ...state.user.connections,
              followers: users.map(user => user.id)
            };
          }
          return users;
        }
      }
    );
  }

  async function followUser(userId: string) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<API.SuccessResponse>(
      () => api.user.followUser(userId),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: async (response) => {
          state.loading = false;
          // Refresh following list after successful follow
          await getFollowing();
          return response;
        }
      }
    );
  }

  async function unfollowUser(userId: string) {
    if (!state.isAuthenticated)
      return;

    state.loading = true;

    return await execute<API.SuccessResponse>(
      () => api.user.unfollowUser(userId),
      {
        onError: () => {
          state.loading = false;
        },
        onSuccess: async (response) => {
          state.loading = false;
          // Refresh following list after successful unfollow
          await getFollowing();
          return response;
        }
      }
    );
  }

  // Return everything that should be available outside the store
  return {
    // State
    ...toRefs(state),

    // Computed properties (getters)
    friends,
    blocked,
    userInfo,
    settings,
    followers,
    following,
    favorites,
    accessToken,
    isAdmin,
    isModerator,

    // Actions
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    // User fetching
    getUser,
    // New social and search actions
    searchUsers,
    getOnlineUsers,
    getFollowing,
    getFollowers,
    followUser,
    unfollowUser,
  };
}), {
  // Default initialization options
  timeout: 10000,
  throwErrors: false
});
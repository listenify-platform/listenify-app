// Validation rules for authentication inputs based on Go backend

import { ApiError } from "../services";

/**
 * Password validation rule
 * Validates password according to backend requirements:
 * - Minimum 8 characters
 * - Maximum 72 characters
 * - Must contain at least one uppercase letter
 * - Must contain at least one lowercase letter
 * - Must contain at least one number
 * - Must contain at least one special character
 */
export const passwordRule = (value: string): boolean | string => {
  if (!value) return 'Password is required';

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (value.length > 72) {
    return 'Password must be less than 72 characters';
  }

  // Additional password complexity requirements
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  if (!hasUppercase) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!hasLowercase) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!hasNumber) {
    return 'Password must contain at least one number';
  }

  if (!hasSpecialChar) {
    return 'Password must contain at least one special character';
  }

  return true;
};

/**
 * Username validation rule
 * Validates username according to backend requirements:
 * - Minimum 3 characters
 * - Maximum 30 characters
 * - Only alphanumeric characters and underscores
 */
export const usernameRule = (value: string): boolean | string => {
  if (!value) return 'Username is required';

  if (value.length < 3) {
    return 'Username must be at least 3 characters';
  }

  if (value.length > 30) {
    return 'Username must be less than 30 characters';
  }

  // Username can only contain alphanumeric characters and underscores
  const validUsernamePattern = /^[a-zA-Z0-9_]+$/;
  if (!validUsernamePattern.test(value)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  return true;
};

/**
 * Password confirmation rule
 * Validates that password confirmation matches the password
 */
export const confirmPasswordRule = (password: string) => (value: string): boolean | string => {
  if (!value) return 'Please confirm your password';

  if (value !== password) {
    return 'Passwords do not match';
  }

  return true;
};

/**
 * Auth forms for handling form validation and submission
 */
export const setupAuth = () => {
  const userStore = useUserStore();
  const { showNotification } = useNotifications();
  const { handleSuccessfulAuth } = useAuthRedirect();

  const loading = ref(false);
  const currentTab = ref('login');

  // Form state management
  const formsValid = reactive({
    login: false,
    register: false
  });

  // Form data
  const loginForm = reactive({
    email: '',
    password: ''
  });

  const registerForm = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Validation trackers
  const loginValidation = reactive({
    email: false,
    password: false
  });

  const registerValidation = reactive({
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  });

  // Update form validity whenever validation states change
  watch(loginValidation, (newVal) => {
    formsValid.login = Object.values(newVal).every(val => val === true);
  }, { deep: true });

  watch(registerValidation, (newVal) => {
    formsValid.register = Object.values(newVal).every(val => val === true);
  }, { deep: true });

  // Handle validation results from form inputs
  const handleValidation = (field: 'email' | 'username' | 'password' | 'confirmPassword', isValid: boolean) => {
    if (currentTab.value === 'login') {
      if (field in loginValidation) {
        loginValidation[field as 'email' | 'password'] = isValid;
      }
    } else {
      registerValidation[field] = isValid;
    }
  };

  // Form submission handler
  const handleForm = async (): Promise<void> => {
    if (loading.value) {
      return;
    }

    // Clear any existing notifications
    loading.value = true;

    try {
      switch (currentTab.value) {
        case 'login': {
          // Validate all fields are filled
          for (const key in loginForm) {
            if (!loginForm[key as keyof typeof loginForm]) {
              showNotification({
                type: 'warning',
                text: 'Please fill all fields',
                title: 'Missing information'
              });
              loading.value = false;
              return;
            }
          }

          try {
            const result = await userStore.login(loginForm);
            if (result) {
              // Login was successful, handle redirect
              handleSuccessfulAuth();
            }
          } catch (error) {
            showNotification({
              type: 'error',
              text: error instanceof ApiError ? error.details.message : 'Unexcepted error',
              title: 'Cannot authorize to account'
            })
          }
          break;
        }

        case 'register': {
          // Validate all fields are filled
          for (const key in registerForm) {
            if (!registerForm[key as keyof typeof registerForm]) {
              showNotification({
                type: 'warning',
                text: 'Please fill all fields',
                title: 'Missing information'
              });
              loading.value = false;
              return;
            }
          }

          // Validate password and confirmation match
          if (registerForm.password !== registerForm.confirmPassword) {
            showNotification({
              type: 'error',
              text: 'Password dosen\'t matches',
              title: 'Cannot create account'
            });
            loading.value = false;
            return;
          }

          try {
            const request = await userStore.register(registerForm);
            if (request) {
              showNotification({
                type: 'success',
                text: 'Welcome to Listenify, enjoy music together!',
                title: 'Account created'
              });
              handleSuccessfulAuth();
            }
          } catch (error) {
            showNotification({
              type: 'error',
              text: error instanceof ApiError ? error.details.message : 'Unexcepted error',
              title: 'Cannot create account'
            })
          }
          break;
        }

        default:
          throw new Error(`Invalid form`);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        text: error instanceof ApiError ? error.details.message : 'Unexcepted error',
        title: `action '${currentTab.value}' error`
      });
    }

    loading.value = false;
  };

  return {
    loading,
    loginForm,
    formsValid,
    currentTab,
    handleForm,
    registerForm,
    loginValidation,
    handleValidation,
    registerValidation
  };
};
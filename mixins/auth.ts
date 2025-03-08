/**
 * @file mixins/auth.ts
 * @description Vue mixins for authentication functionality
 */
import { reactive, ref, watch, onMounted, nextTick } from 'vue';

// Validation rules for authentication inputs based on Go backend

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
export const setupAuth = (handleSuccessfulAuth: Function) => {
  const userStore = useUserStore();
  const { login, register } = userStore;
  // const { handleSuccessfulAuth } = useAuthRedirect();

  const loading = ref(false);

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
  const handleValidation = (field: 'email' | 'username' | 'password' | 'confirmPassword', form: 'login' | 'register', isValid: boolean) => {
    if (form === 'login') {
      if (field in loginValidation) {
        loginValidation[field as 'email' | 'password'] = isValid;
      }
    } else {
      registerValidation[field] = isValid;
    }
  };

  // Form submission handler
  const handleForm = async (type: string): Promise<void> => {
    if (loading.value) {
      return;
    }

    // Clear any existing notifications
    loading.value = true;

    try {
      switch (type) {
        case 'login': {
          // Validate all fields are filled
          for (const key in loginForm) {
            if (!loginForm[key as keyof typeof loginForm]) {
              // showNotification('warning', 'Please fill in all fields.', 'Missing information');
              loading.value = false;
              return;
            }
          }

          try {
            const result = await login(loginForm);
            if (result) {
              // Login was successful, handle redirect
              handleSuccessfulAuth();
            }
          } catch (error) {
            // handleApiError(error, 'login');
          }
          break;
        }

        case 'register': {
          // Validate all fields are filled
          for (const key in registerForm) {
            if (!registerForm[key as keyof typeof registerForm]) {
              // showNotification('warning', 'Please fill in all fields.', 'Missing information');
              loading.value = false;
              return;
            }
          }

          // Validate password and confirmation match
          if (registerForm.password !== registerForm.confirmPassword) {
            // showNotification('error', 'Password and confirmation do not match.', 'Password mismatch');
            loading.value = false;
            return;
          }

          try {
            const request = await register(registerForm);
            if (request) {
              // showNotification('success', 'Your account has been created successfully!', 'Account created');
              // After registration, handle redirect
              handleSuccessfulAuth();
            }
          } catch (error) {
            // handleApiError(error, 'register');
          }
          break;
        }

        default:
          throw new Error(`Invalid form type: ${type}`);
      }
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      // showNotification('error', 'An unexpected error occurred. Please try again.', 'Error');
    }

    loading.value = false;
  };

  return {
    loading,
    formsValid,
    loginForm,
    registerForm,
    loginValidation,
    registerValidation,
    handleValidation,
    handleForm,
    usernameRule,
    passwordRule,
    confirmPasswordRule
  };
};
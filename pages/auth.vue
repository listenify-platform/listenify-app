<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  allowWhenLogged: false
})

import { setupAuth, passwordRule, usernameRule, confirmPasswordRule } from '~/custom';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

const { 
  loading,
  loginForm,
  currentTab,
  formsValid,
  handleForm,
  registerForm,
  handleValidation,
} = setupAuth();
</script>

<style lang="scss" scoped module>
.auth {
  &__form {
    @apply flex h-full w-full items-center justify-center transition-all;
    @apply lg:w-1/3;
  }

  &__content {
    @apply relative w-full space-y-8 px-4 sm:px-6 xl:w-3/4 2xl:w-2/3;
  }

  &__container {
    @apply flex flex-col h-full w-full;
  }

  &__form-fields {
    @apply flex flex-col space-y-6;
  }

  // Form layout
  &__form {
    @apply flex h-full w-full items-center justify-center transition-all;
    @apply lg:w-1/3;
  }

  // Background elements
  &__background {
    @apply h-full w-full p-3;
    @apply hidden lg:block lg:w-2/3;

    &-container {
      @apply border-white/20 relative h-full w-full overflow-hidden rounded-2xl border;
    }

    &-inner {
      @apply flex h-full w-full flex-col items-center justify-center overflow-hidden;
    }

    &-image {
      @apply h-screen w-full;
      background: url(@/assets/img/background-hero.jpg) center no-repeat;
      background-size: cover;
    }
  }

  // Tabs styling
  &__tabs {
    @apply w-full transition-all;
  }

  &__tabs-list {
    @apply flex relative mb-8;
  }

  &__tabs-indicator {
    @apply absolute px-12 left-0 h-[2px] bottom-0 w-[--reka-tabs-indicator-size] translate-x-[--reka-tabs-indicator-position] translate-y-[1px] rounded-full transition-all duration-300;
  }

  &__indicator-line {
    @apply bg-white h-full w-full rounded-full;
  }

  &__tab-trigger {
    @apply px-4 py-3 flex-1 flex items-center justify-center text-sm font-medium leading-none select-none outline-none cursor-pointer transition-colors duration-200;
    @apply text-gray-400 hover:text-white;

    &[data-state="active"] {
      @apply text-white;
    }
  }

  // Animation container
  &__tabs-wrapper {
    @apply relative overflow-hidden;
    // Advanced animation handling
    transition: all 0.3s ease;
  }

  &__tab-content {
    @apply outline-none absolute w-full;
    transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease;
    // Start with a large enough max-height that's common for both tabs
    max-height: 600px;
    will-change: opacity, transform, max-height;

    &[data-state="inactive"] {
      @apply opacity-0 pointer-events-none;
      transform: translateY(10px);
      max-height: 0;
      overflow: hidden;
    }

    &[data-state="active"] {
      @apply opacity-100 z-10;
      transform: translateY(0);
      // When active, ensure content is visible
      max-height: 600px;
      position: relative; // Switch from absolute to relative when active
    }
  }

  &__tab-inner {
    @apply py-1; // Add small padding to prevent content jumping
    // Improve animation smoothness
    will-change: height;
  }

  // Optimize transition between forms
  &__form-fields {
    @apply transition-opacity duration-300;
    will-change: opacity;
  }

  // Footer elements
  &__footer {
    &-links {
      @apply mt-4 flex justify-between items-center text-sm;
    }

    &-center {
      @apply mt-4 flex justify-center items-center text-sm;
    }

    &-text {
      @apply text-gray-500;
    }

    &-link {
      @apply text-white ml-1 hover:underline;
    }
  }
}
</style>

<template>
  <div :class="$style['auth__container']">
    <div :class="$style['auth__form']">
      <div :class="$style['auth__content']">
        <TabsRoot default-value="login" v-model="currentTab" :class="$style['auth__tabs']">
          <TabsList :class="$style['auth__tabs-list']">
            <TabsIndicator :class="$style['auth__tabs-indicator']">
              <div :class="$style['auth__indicator-line']"></div>
            </TabsIndicator>

            <TabsTrigger :class="$style['auth__tab-trigger']" value="login">
              <span>Sign in</span>
            </TabsTrigger>
            <TabsTrigger :class="$style['auth__tab-trigger']" value="register">
              <span>Sign up</span>
            </TabsTrigger>
          </TabsList>

          <div :class="$style['auth__tabs-wrapper']">
            <!-- login -->
            <TabsContent value="login" :class="$style['auth__tab-content']">
              <div :class="$style['auth__tab-inner']">
                <form :class="$style['auth__form-fields']" @submit.prevent="handleForm">
                  <CommonFormsInput
                    id="login-email" 
                    type="email" 
                    placeholder="E-mail address"
                    input-placeholder="Enter your e-mail address" 
                    required
                    v-model="loginForm.email" 
                    @validation="handleValidation('email', $event)"
                  />
                  <CommonFormsInput
                    id="login-password" 
                    type="password" 
                    placeholder="Password"
                    input-placeholder="Enter your password" 
                    required 
                    :rules="[passwordRule]"
                    show-password
                    v-model="loginForm.password" 
                    @validation="handleValidation('password', $event)"
                  />

                  <CommonButton
                    type="submit"
                    :loading="loading" 
                    :disabled="!formsValid.login || loading"
                    variant="primary"
                  >
                    <span>Sign in</span>
                  </CommonButton>
                </form>
              </div>
            </TabsContent>

            <!-- register -->
            <TabsContent value="register" :class="$style['auth__tab-content']">
              <div :class="$style['auth__tab-inner']">
                <form :class="$style['auth__form-fields']" @submit.prevent="handleForm">
                  <CommonFormsInput 
                    id="register-username" 
                    type="text" 
                    placeholder="Username"
                    input-placeholder="Enter your username" 
                    required 
                    :rules="[usernameRule]"
                    v-model="registerForm.username" 
                    @validation="handleValidation('username', $event)"
                  />
                  <CommonFormsInput
                    id="register-email" 
                    type="email" 
                    placeholder="E-mail address"
                    input-placeholder="Enter your e-mail address" 
                    required
                    v-model="registerForm.email" 
                    @validation="handleValidation('email', $event)"
                  />
                  <CommonFormsInput
                    id="register-password" 
                    type="password" 
                    placeholder="Password"
                    input-placeholder="Create a password" 
                    required 
                    :rules="[passwordRule]"
                    show-password
                    v-model="registerForm.password" 
                    @validation="handleValidation('password', $event)"
                  />
                  <CommonFormsInput
                    id="register-confirm" 
                    type="password" 
                    placeholder="Confirm password"
                    input-placeholder="Confirm your password" 
                    required
                    show-password
                    :rules="[confirmPasswordRule(registerForm.password)]"
                    v-model="registerForm.confirmPassword" 
                    @validation="handleValidation('confirmPassword', $event)"
                  />

                  <CommonButton
                    type="submit"
                    :loading="loading" 
                    :disabled="!formsValid.register || loading"
                    variant="primary"
                  >
                    <span>Create account</span>
                  </CommonButton>
                </form>
              </div>
            </TabsContent>
          </div>
        </TabsRoot>
      </div>
    </div>
  </div>
</template>
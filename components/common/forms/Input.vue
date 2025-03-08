<script setup lang="ts">
import { Label } from 'reka-ui';
import { ref, computed, watch, onMounted } from 'vue';

interface FormInputProps {
  id?: string;
  type?: string;
  rules?: Array<(value: any) => boolean | string>;
  required?: boolean;
  modelValue?: string | number;
  placeholder?: string;
  showPassword?: boolean;
  errorMessage?: string;
  inputPlaceholder?: string;
  validateOnInput?: boolean; // Add this prop to control validation behavior
}

const props = withDefaults(defineProps<FormInputProps>(), {
  id: 'form-input',
  type: 'text',
  rules: () => [],
  required: false,
  modelValue: '',
  placeholder: 'Label',
  showPassword: false,
  errorMessage: '',
  inputPlaceholder: 'Input',
  validateOnInput: true // Default to validating on input
});

const emit = defineEmits(['update:modelValue', 'validation']);

// Class definitions for component parts
// This allows for consistent naming and easy updates
const CLASS_MAP = {
  root: 'form-input',
  label: {
    container: 'form-input__label',
    text: 'form-input__label-text',
    required: 'form-input__label-required'
  },
  field: {
    container: 'form-input__field',
    input: 'form-input__field-control',
    error: 'form-input__field--error'
  },
  toggle: 'form-input__password-toggle',
  error: 'form-input__error-message'
};

// Initialize reactive variables first
const touched = ref(false);
const error = ref('');
const inputType = ref(props.type);
const internalValue = ref(props.modelValue);

// Computed property for v-model
const inputValue = computed({
  get: () => internalValue.value,
  set: (value) => {
    internalValue.value = value;
    emit('update:modelValue', value);
    
    // Validate on input if that option is enabled and the field has been touched
    if (props.validateOnInput && touched.value) {
      validate();
    }
  }
});

// Update internal value when prop changes
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal;
  if (touched.value) {
    validate();
  }
}, { immediate: true });

// Toggle password visibility
const togglePasswordVisibility = () => {
  if (props.type === 'password') {
    inputType.value = inputType.value === 'password' ? 'text' : 'password';
  }
};

// Get field classes with error state
const fieldClasses = computed(() => {
  return [
    CLASS_MAP.field.container,
    { [CLASS_MAP.field.error]: error.value }
  ];
});

// Validate input based on type and rules
const validate = () => {
  touched.value = true;
  error.value = '';
  
  // Required validation
  if (props.required && !internalValue.value) {
    error.value = props.errorMessage || `${props.placeholder} is required`;
    emit('validation', false);
    return false;
  }
  
  // Type validation
  if (internalValue.value) {
    // Email validation
    if (props.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(internalValue.value as string)) {
      error.value = 'Please enter a valid email address';
      emit('validation', false);
      return false;
    }
    
    // Number validation
    if (props.type === 'number' && isNaN(Number(internalValue.value))) {
      error.value = 'Please enter a valid number';
      emit('validation', false);
      return false;
    }
    
    // URL validation
    if (props.type === 'url' && !/^https?:\/\/\S+$/.test(internalValue.value as string)) {
      error.value = 'Please enter a valid URL';
      emit('validation', false);
      return false;
    }
    
    // Custom rules validation
    for (const rule of props.rules) {
      const result = rule(internalValue.value);
      if (result !== true) {
        error.value = typeof result === 'string' ? result : 'Invalid input';
        emit('validation', false);
        return false;
      }
    }
  }
  
  emit('validation', true);
  return true;
};

// Handle input event - mark as touched on first input
const handleInput = () => {
  if (!touched.value) {
    touched.value = true;
  }
  
  if (props.validateOnInput) {
    validate();
  }
};

// Initialize component
onMounted(() => {
  // Validate showPassword is only used with password type
  if (props.showPassword && props.type !== 'password') {
    console.warn('showPassword prop can only be used with type="password"');
  }
  
  // Make sure internal value is set correctly
  internalValue.value = props.modelValue;
  
  // Initial validation state emission
  if (props.required && !internalValue.value) {
    emit('validation', false);
  } else {
    // If we have an initial value, validate it
    if (internalValue.value) {
      validate();
    } else {
      // If not required and no value, it's valid
      emit('validation', true);
    }
  }
});
</script>

<style lang="scss" scoped>
.form-input {
  @apply flex w-full flex-col space-y-3;

  // Label styling
  &__label {
    @apply flex items-center justify-between;

    &-text {
      @apply text-sm font-semibold text-white;
    }

    &-required {
      @apply text-red-500 ml-1;
    }
  }

  // Input field styling
  &__field {
    @apply flex h-10 items-center space-x-2 rounded-md border px-2.5;
    @apply transition-colors duration-200;
    @apply border-white/20;
    
    &--error {
      @apply border-red-700;
    }

    &-control {
      @apply h-full w-full border-0 bg-transparent p-0 text-sm font-medium text-white;
      @apply focus:border-opacity-0 focus:outline-none focus:border-0 focus:ring-0;
    }
  }
  
  // Password toggle button
  &__password-toggle {
    @apply cursor-pointer transition-colors text-white/60 hover:text-white;
    @apply bg-transparent border-0 p-0 focus:outline-none;
  }
  
  // Error message
  &__error-message {
    @apply mt-1 text-xs font-medium text-red-500;
  }
}
</style>

<template>
  <div :class="CLASS_MAP.root">
    <div :class="CLASS_MAP.label.container">
      <Label :class="CLASS_MAP.label.text" :for="id">
        {{ placeholder }}
        <span v-if="required" :class="CLASS_MAP.label.required">*</span>
      </Label>
    </div>
    <div :class="fieldClasses">
      <input
        :id="id"
        :type="inputType"
        :placeholder="inputPlaceholder"
        :class="CLASS_MAP.field.input"
        v-model="inputValue"
        @input="handleInput"
        @blur="validate"
      >
      <button
        type="button"
        v-if="type === 'password'" 
        @click="togglePasswordVisibility" 
        :class="CLASS_MAP.toggle"
      >
        <svg v-if="inputType === 'password'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </button>
    </div>
    <div v-if="error" :class="CLASS_MAP.error" v-text="error"></div>
  </div>
</template>
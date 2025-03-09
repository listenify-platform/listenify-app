

<style lang="scss" scoped module>
.chat-box {
  @apply w-80 bg-black/90 border-l border-gray-800 flex flex-col h-full;

  .chat-welcome {
    @apply p-4 text-sm text-gray-400 border-b border-gray-800/30;
  }

  .chat-messages {
    @apply flex-1 overflow-y-auto px-4 py-2;
    
    .chat-message {
      @apply flex items-start gap-2 mb-3 last:mb-0;
      
      .message-avatar {
        @apply w-6 h-6 rounded-full flex-shrink-0;
      }
      
      .message-content {
        @apply flex-1 min-w-0;
        
        .message-header {
          @apply flex items-center gap-1 mb-0.5;
          
          .badge {
            @apply w-3 h-3 rounded-full;
          }
          
          .username {
            @apply font-medium text-sm truncate;
          }
        }
        
        .message-text {
          @apply text-white text-sm break-words;
        }
      }
      
      .message-time {
        @apply text-gray-500 text-xs flex-shrink-0 self-start mt-0.5;
      }
    }
  }

  .chat-input-container {
    @apply p-3 border-t border-gray-800 flex items-center;
    
    .input-wrapper {
      @apply flex-1 relative;
      
      .chat-input {
        @apply w-full bg-gray-800 rounded-md px-3 py-2 text-sm text-white;
        @apply focus:outline-none focus:ring-1 focus:ring-purple-500;
      }
      
      .emoji-button {
        @apply absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors;
      }
    }
    
    .options-button {
      @apply ml-2 text-gray-200 hover:text-white transition-colors;
    }
  }
}
</style>

<script setup lang="ts">
import 'simplebar-vue/dist/simplebar.min.css';
import simplebar from 'simplebar-vue';
import type { Chat } from '~/custom';

const emit = defineEmits(['message-sent']);

const props = defineProps({
  messages: {
    type: Array as () => Chat.Message[],
    required: true
  }
});

// Message input
const newMessage = ref('');
const messagesScroll = ref<HTMLElement | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

// Send message function
const sendMessage = () => {
  if (newMessage.value.trim()) {
    emit('message-sent', newMessage.value);
    newMessage.value = '';
  }
};

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages.length, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});

// Initial scroll to bottom on mount
onMounted(async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});
</script>

<template>
  <div :class="$style['chat-box']">
    <!-- Welcome message -->
    <div :class="$style['chat-welcome']">
      <p>Welcome to listenify</p>
    </div>

    <!-- Messages container -->
    <div :class="$style['chat-messages']" ref="messagesContainer">
      <simplebar ref="messagesScroll">
        <div></div>
      </simplebar>
      <!-- <div v-for="(message, idx) in messages" :key="idx" class="chat-message">
        <div class="message-content">
          <div class="message-header">
            <span class="username">
            </span>
          </div>
          <p class="message-text" v-text="message.content"></p>
        </div>
        <span class="message-time">{{ message.time }}</span>
      </div> -->
    </div>

    <!-- Input area -->
    <div :class="$style['chat-input-container']">
      <div :class="$style['input-wrapper']">
        <input 
          v-model="newMessage" 
          :class="$style['chat-input']"
          type="text" 
          placeholder="Say something..." 
          @keyup.enter="sendMessage" 
        />
        <button :class="$style['emoji-button']">
          <FontAwesomeIcon icon="fa-solid fa-smile" />
        </button>
      </div>
      <button :class="$style['options-button']">
        <FontAwesomeIcon icon="fa-solid fa-ellipsis-v" />
      </button>
    </div>
  </div>
</template>
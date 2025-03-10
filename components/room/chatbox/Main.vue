<template>
  <div :class="$style['chat-box']">
    <!-- Welcome message -->
    <div :class="$style['chat-welcome']">
      <p>Welcome to listenify</p>
    </div>

    <!-- Messages container -->
    <div :class="$style['chat-messages']">
      <simplebar ref="messagesContainer" class="h-full">
        <div class="h-full flex flex-col flex-grow">
          <div v-for="message in allMessages" :key="message.id" :class="$style['chat-message']">
            <!-- <img 
              :src="`/avatars/${message.user.avatarConfig.collection}/${message.user.avatarConfig.number}.png`" 
              :class="$style['message-avatar']" 
              :alt="message.user.username"
            /> -->
            <div :class="$style['message-content']">
              <div :class="$style['message-header']">
                <div 
                  :class="$style['badge']" 
                  :style="{ backgroundColor: message.userRole === 'admin' ? '#ff5722' : '#4caf50' }"
                ></div>
                <span :class="$style['username']" v-text="message.user.username"></span>
              </div>
              <p :class="$style['message-text']" v-text="message.content"></p>
            </div>
            <span :class="$style['message-time']">
              {{ formatTimestamp(message.timestamp) }}
              {{ message.id.startsWith('pending-') ? '(sending...)' : '' }}
            </span>
          </div>
        </div>
      </simplebar>
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

<script setup lang="ts">
import 'simplebar-vue/dist/simplebar.min.css';
import simplebar from 'simplebar-vue';
import { useChatStore } from '~/stores/chat';
import { useRoomStore } from '~/stores/room';
import { storeToRefs } from 'pinia';

// Get stores
const chatStore = useChatStore();
const roomStore = useRoomStore();
const { $moment } = useNuxtApp();

// Get reactive refs from stores
const { messages, pendingMessages } = storeToRefs(chatStore);
const { currentRoom } = storeToRefs(roomStore);

// Format timestamp helper
const formatTimestamp = (timestamp: string | number) => {
  if (!timestamp) return '';
  
  // For recent messages (less than 24 hours ago), show relative time
  const messageDate = $moment(timestamp);
  const now = $moment();
  
  if (now.diff(messageDate, 'hours') < 24) {
    return messageDate.fromNow();
  } else if (now.diff(messageDate, 'days') < 7) {
    // For messages within the last week, show day and time
    return messageDate.format('ddd h:mm A');
  } else {
    // For older messages, show date and time
    return messageDate.format('MMM D, h:mm A');
  }
};

// Computed property for combined messages
const allMessages = computed(() => {
  // Ensure we have valid arrays to work with
  const serverMessages = Array.isArray(messages.value) ? messages.value : [];
  const pendingArray = pendingMessages.value ? 
    Array.from(pendingMessages.value.values()) : [];
  
  // Combine and sort messages, with null checks
  return [...serverMessages, ...pendingArray]
    .filter(msg => msg != null)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || Date.now()).getTime();
      const timeB = new Date(b.timestamp || Date.now()).getTime();
      return timeA - timeB;
    });
});

// Message input
const newMessage = ref('');
const messagesContainer = ref<InstanceType<typeof simplebar> | null>(null);

// Helper function to scroll to bottom
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    const el = messagesContainer.value.$el as HTMLElement;
    const scrollElement = el.querySelector('.simplebar-content-wrapper') as HTMLElement;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }
};

// Send message function
const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value);
    newMessage.value = '';
    scrollToBottom();
  }
};

// Auto-scroll to bottom when new messages arrive
watch(() => allMessages.value.length, scrollToBottom);

// Load chat history when entering room
watch(() => currentRoom.value?.id, async (newRoomId) => {
  if (newRoomId) {
    await chatStore.loadChatHistory(newRoomId);
    scrollToBottom();
  } else {
    chatStore.clearMessages();
  }
});

// Initial scroll to bottom on mount
onMounted(async () => {
  if (currentRoom.value?.id) {
    await chatStore.loadChatHistory(currentRoom.value.id);
  }
  scrollToBottom();
});

// Cleanup on unmount
onUnmounted(() => {
  chatStore.clearMessages();
});
</script>

<style lang="scss" scoped module>
.chat-box {
  @apply w-80 bg-black/90 border-l border-gray-800 h-full relative;

  .chat-welcome {
    @apply p-4 text-sm text-gray-400 border-b border-gray-800/30;
    height: 44px;
  }

  .chat-messages {
    @apply absolute inset-x-0 overflow-auto;
    top: 44px; // Height of welcome message
    bottom: 64px; // Height of input container + padding
    
    :deep(.simplebar-wrapper) {
      @apply h-full;
    }

    :deep(.simplebar-content-wrapper) {
      @apply h-full;
    }

    :deep(.simplebar-content) {
      @apply h-full flex flex-col p-4;
    }

    :deep(.simplebar-track.simplebar-vertical) {
      @apply w-2;
      right: 2px;

      .simplebar-scrollbar:before {
        @apply bg-white/20;
      }
    }
    
    .chat-message {
      @apply flex items-start pl-2 pr-2 gap-2 mb-4 last:mb-0;
      
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
    @apply absolute inset-x-0 bottom-0 p-3 border-t border-gray-800 flex items-center bg-black/90 z-10;
    
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
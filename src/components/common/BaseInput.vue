<script setup>
import { ref } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    type: {
        type: String,
        default: 'text'
    },
    placeholder: String,
    required: Boolean,
    error: String,
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const togglePassword = () => {
    showPassword.value = !showPassword.value
}
</script>

<template>
    <div class="flex flex-col gap-1.5 w-full text-left">
        <label v-if="label" class="text-xs font-semibold text-gray-600">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </label>

        <div class="relative w-full">
            <input :type="type === 'password' ? (showPassword ? 'text' : 'password') : type" :value="modelValue"
                @input="emit('update:modelValue', $event.target.value)" :placeholder="placeholder" :class="[
                    'w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 text-gray-900 transition duration-200 outline-none focus:bg-white',
                    error
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                ]" :disabled="disabled" />

            <!-- Password Eye Toggle Icon -->
            <button v-if="type === 'password'" type="button" @click="togglePassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 013.682-.823c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-6.002-2.14a3 3 0 11-4.243-4.243" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                </svg>
            </button>
        </div>

        <span v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</span>
    </div>
</template>
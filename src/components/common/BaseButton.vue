<script setup>
defineProps({
    type: {
        type: String,
        default: 'button'
    },
    loading: Boolean,
    disabled: Boolean
})
</script>

<template>
    <button :type="type" :disabled="disabled || loading"
        class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition duration-200 shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
        <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
        </svg>
        <slot />
    </button>
</template>
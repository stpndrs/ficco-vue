<script setup>
defineProps({
    modelValue: [String, Number],
    label: String,
    options: {
        type: Array,
        default: () => []
    },
    valueKey: {
        type: String,
        default: 'id'
    },
    labelKey: {
        type: String,
        default: 'name'
    },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    error: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <div class="flex flex-col gap-1.5 w-full text-left">
        <label v-if="label" class="text-xs font-semibold text-gray-600">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </label>

        <div class="relative w-full">
            <select :value="modelValue" :disabled="disabled" @change="emit('update:modelValue', $event.target.value)"
                :class="[
                    'w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 text-gray-900 transition duration-200 outline-none appearance-none focus:bg-white',
                    disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : '',
                    error
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                ]">
                <option v-if="placeholder" value="" disabled selected hidden>
                    {{ placeholder }}
                </option>
                <option v-for="(opt, idx) in options" :key="typeof opt === 'object' ? opt[valueKey] : idx"
                    :value="typeof opt === 'object' ? opt[valueKey] : opt">
                    {{ typeof opt === 'object' ? opt[labelKey] : opt }}
                </option>
            </select>

            <!-- Custom Chevron Dropdown Icon -->
            <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <span v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</span>
    </div>
</template>
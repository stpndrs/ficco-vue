<script setup>
import { ref } from 'vue'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const email = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)
const validationMessage = ref([])

const handleForgotPassword = async () => {
    loading.value = true
    message.value = ''
    validationMessage.value = []

    try {
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/forgot-password`, {
            email: email.value
        })

        if (res.data.status) {
            isError.value = false
            message.value = 'Instruksi reset password telah dikirim ke email Anda.'
        }
    } catch (err) {
        isError.value = true
        message.value = err.response?.data?.message || 'Gagal mengirim email reset password.'
        validationMessage.value = err.response?.data?.errors
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div
            class="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-slate-100 border border-slate-100 text-center">
            <!-- Icon Header -->
            <div
                class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>

            <h2 class="text-xl font-bold text-gray-900 mb-1">Forgot Password</h2>
            <p class="text-xs text-gray-500 mb-6">
                Enter your registered corporate email to receive password recovery instructions.
            </p>

            <div v-if="message"
                :class="['mb-4 p-3 rounded-xl text-xs font-medium border text-left', isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200']">
                {{ message }}
            </div>

            <form @submit.prevent="handleForgotPassword" class="space-y-4 text-left">
                <BaseInput v-model="email" type="email" label="Corporate Email Address"
                    placeholder="jordan@artisancoffee.com" :error="validationMessage?.email?.[0] || null"
                    required />

                <BaseButton type="submit" :loading="loading" class="mt-4">
                    Send Recovery Email
                </BaseButton>
            </form>

            <router-link to="/login"
                class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mt-6">
                ← Return to Sign In
            </router-link>
        </div>
    </div>
</template>
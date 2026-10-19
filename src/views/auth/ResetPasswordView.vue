<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const handleReset = async () => {
    loading.value = true
    message.value = ''

    try {
        const token = route.query.token || ''
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/reset-password`, {
            token,
            newPassword: newPassword.value
        })

        if (res.data.status) {
            isError.value = false
            message.value = 'Password berhasil direset! Mengalihkan ke login...'
            setTimeout(() => router.push('/login'), 2000)
        }
    } catch (err) {
        isError.value = true
        message.value = err.response?.data?.message || 'Gagal mereset password.'
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
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            <h2 class="text-xl font-bold text-gray-900 mb-1">Reset Password</h2>
            <p class="text-xs text-gray-500 mb-6">
                Enter your registered corporate email to receive password recovery instructions.
            </p>

            <div v-if="message"
                :class="['mb-4 p-3 rounded-xl text-xs font-medium border', isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200']">
                {{ message }}
            </div>

            <form @submit.prevent="handleReset" class="space-y-4 text-left">
                <BaseInput v-model="newPassword" type="password" label="New Password" placeholder="Your New Password"
                    required />

                <BaseButton type="submit" :loading="loading" class="mt-4">
                    Reset My Password
                </BaseButton>
            </form>

            <router-link to="/login"
                class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mt-6">
                ← Return to Sign In
            </router-link>
        </div>
    </div>
</template>
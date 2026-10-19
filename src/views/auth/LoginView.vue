<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AuthHero from '@/components/auth/AuthHero.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const form = ref({
    username: '',
    password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/login`, form.value)
        if (res.data.status) {
            localStorage.setItem('token', res.data.data.token)
            router.push('/dashboard')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Login gagal. Periksa kembali akun Anda.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex min-h-screen bg-white">
        <!-- Left Hero -->
        <AuthHero />

        <!-- Right Form Section -->
        <div class="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20">
            <div class="w-full max-w-md text-left">
                <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    Sign In to Your Workspace
                </h2>
                <p class="text-sm text-gray-500 mb-8">
                    Enter your credentials to access your financial dashboard.
                </p>

                <!-- Alert Error -->
                <div v-if="errorMessage"
                    class="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <BaseInput v-model="form.username" label="Account Email / Username"
                        placeholder="jordan@artisancoffee.com" required />

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="text-xs font-semibold text-gray-600">Password *</label>
                            <router-link to="/forgot-password"
                                class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                Forgot Password?
                            </router-link>
                        </div>
                        <BaseInput v-model="form.password" type="password" placeholder="Enter your account password"
                            required />
                    </div>

                    <BaseButton type="submit" :loading="loading" class="mt-6">
                        Sign In to Dashboard
                    </BaseButton>
                </form>

                <p class="text-xs text-gray-500 text-center mt-8">
                    Don't have an account yet?
                    <router-link to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700 ml-1">
                        Register Business
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>
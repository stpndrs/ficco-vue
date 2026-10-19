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
    companyName: '',
    ownerPhone: '',
    companyAddress: '',
    initialCapital: 0,
    password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const payload = {
            ...form.value,
            initialCapital: Number(form.value.initialCapital)
        }
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/register`, payload)
        if (res.data.status) {
            router.push('/login')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Registrasi gagal. Periksa data Anda.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex min-h-screen bg-white">
        <AuthHero />

        <div class="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20 overflow-y-auto">
            <div class="w-full max-w-xl text-left">
                <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    Register Your Business
                </h2>
                <p class="text-sm text-gray-500 mb-8">
                    Complete your business setup in minutes to launch your workspace.
                </p>

                <div v-if="errorMessage"
                    class="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleRegister" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaseInput v-model="form.companyName" label="Registered Business Name"
                        placeholder="Artisan Coffee Roasters & Cafe" required />

                    <BaseInput v-model="form.ownerPhone" label="Owner Contact Phone" placeholder="+1 (206) 555-0192"
                        required />

                    <BaseInput v-model="form.username" label="Corporate Email / Username"
                        placeholder="jordan@artisancoffee.com" required />

                    <BaseInput v-model="form.initialCapital" type="number" label="Initial Business Capital ($)"
                        placeholder="50,000" required />

                    <div class="md:col-span-2">
                        <BaseInput v-model="form.companyAddress" label="Business Headquarters Address"
                            placeholder="104 Pike Street, Suite 400, Seattle, WA" required />
                    </div>

                    <div class="md:col-span-2">
                        <BaseInput v-model="form.password" type="password" label="Master Account Password"
                            placeholder="Create strong password (min. 6 chars)" required />
                    </div>

                    <div class="md:col-span-2 mt-4">
                        <BaseButton type="submit" :loading="loading">
                            Create Business Account
                        </BaseButton>
                    </div>
                </form>

                <div class="flex justify-between items-center text-xs text-gray-500 mt-6">
                    <p>
                        Already registered?
                        <router-link to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700 ml-1">
                            Sign In
                        </router-link>
                    </p>
                    <router-link to="/forgot-password" class="text-gray-400 hover:text-gray-600">
                        Forgot password?
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
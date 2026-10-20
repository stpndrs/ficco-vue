<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationMessage = ref({})

const form = ref({
    userId: '',
    companyName: '',
    companyAddress: '',
    ownerName: '',
    ownerPhone: '',
    email: '',
    password: ''
})

const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            const profile = res.data.data?.profile || {}
            const user = res.data.data?.user || {}

            form.value.userId = user.id || ''
            form.value.companyName = profile.umkmName || profile.companyName || ''
            form.value.companyAddress = profile.umkmAddress || profile.companyAddress || ''
            form.value.ownerName = profile.ownerName || user.name || ''
            form.value.ownerPhone = profile.ownerPhone || user.phone || ''
            form.value.email = user.email || ''
        }
    } catch (err) {
        console.error('Failed to load profile for edit:', err)
    }
}

onMounted(fetchProfile)

const handleSaveChanges = async () => {
    isSubmitting.value = true
    errorMessage.value = ''
    validationMessage.value = {}

    try {
        const token = localStorage.getItem('token')

        // Payload JSON sesuai spesifikasi APIdog Request
        const payload = {
            userId: form.value.userId,
            companyName: form.value.companyName,
            companyAddress: form.value.companyAddress,
            ownerName: form.value.ownerName,
            ownerPhone: form.value.ownerPhone,
            email: form.value.email
        }

        // Tambahkan password jika pengguna memasukkannya
        if (form.value.password) {
            payload.password = form.value.password
        }

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/users/profile`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (res.data.status) {
            router.push('/profile')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal memperbarui profil bisnis.'
        validationMessage.value = err.response?.data?.errors || {}
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto text-left px-4 sm:px-6 py-4 space-y-4">
        <!-- Alert Error Global -->
        <div v-if="errorMessage"
            class="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage }}</span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-base font-bold text-slate-900">Update Business & Founder Profile</h2>
                        <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">EDIT PROFILE</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">Update corporate entity information or master workspace credentials.</p>
                </div>
                <router-link to="/profile"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                    v-model="form.companyName"
                    label="Registered Business Name *"
                    placeholder="e.g. PT Tech Solusindo Terbaru"
                    :error="validationMessage?.companyName?.[0] || null"
                    required
                />

                <BaseInput
                    v-model="form.ownerName"
                    label="Founder Full Name *"
                    placeholder="e.g. Stevan Andreas"
                    :error="validationMessage?.ownerName?.[0] || null"
                    required
                />

                <BaseInput
                    v-model="form.companyAddress"
                    label="Headquarters & Store Address"
                    placeholder="e.g. Jl. Basuki Rahmat No. 12, Surabaya"
                    :error="validationMessage?.companyAddress?.[0] || null"
                />

                <BaseInput
                    v-model="form.ownerPhone"
                    label="Founder Contact Phone"
                    placeholder="e.g. 081234567899"
                    :error="validationMessage?.ownerPhone?.[0] || null"
                />

                <div class="sm:col-span-2">
                    <BaseInput
                        v-model="form.email"
                        label="Corporate Workspace Email *"
                        type="email"
                        placeholder="stevan.new@example.com"
                        :error="validationMessage?.email?.[0] || null"
                        required
                    />
                </div>

                <div class="sm:col-span-2">
                    <BaseInput
                        v-model="form.password"
                        label="Update Password (Optional)"
                        type="password"
                        placeholder="Biarkan kosong jika tidak ingin mengubah password"
                        :error="validationMessage?.password?.[0] || null"
                    />
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/profile"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <BaseButton :loading="isSubmitting" @click="handleSaveChanges" class="!w-auto !px-6 !py-2.5 !text-xs">
                    ✓ Save Profile Changes
                </BaseButton>
            </div>
        </div>
    </div>
</template>
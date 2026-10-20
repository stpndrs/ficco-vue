<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { formatCurrency } from '@/helpers/formatCurrency'

const profileData = ref({
    id: '',
    umkmName: '',
    umkmAddress: '',
    modalAwal: '0',
    ownerName: '',
    ownerPhone: '',
    email: '',
    username: '',
    profileImage: null,
    role: 'Owner'
})

const isLoading = ref(true)

const fetchProfile = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            const profile = res.data.data?.profile || {}
            const user = res.data.data?.user || {}

            profileData.value = {
                id: user.id || '',
                umkmName: profile.umkmName || '-',
                umkmAddress: profile.umkmAddress || '-',
                modalAwal: profile.modalAwal || '0',
                ownerName: profile.ownerName || user.name || '-',
                ownerPhone: profile.ownerPhone || user.phone || '-',
                email: user.email || '-',
                username: user.username || '-',
                profileImage: profile.profileImage || user.profileImage || null,
                role: user.role || 'Owner'
            }
        }
    } catch (err) {
        console.error('Failed to load profile:', err)
    } finally {
        isLoading.value = false
    }
}

const getInitials = (name) => {
    if (!name) return 'SA'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

onMounted(fetchProfile)
</script>

<template>
    <div class="max-w-4xl mx-auto text-left space-y-6 px-4 sm:px-6 py-4">
        <!-- Skeleton Loading State -->
        <div v-if="isLoading"
            class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-slate-400 text-xs">
            Memuat data profil bisnis...
        </div>

        <template v-else>
            <!-- Profile Banner & Main Header Card -->
            <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700"></div>

                <div
                    class="px-6 sm:px-8 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mt-12">
                    <div class="flex items-end gap-4">
                        <div
                            class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 border-4 border-white shadow-xl overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                            <img v-if="profileData.profileImage" :src="profileData.profileImage"
                                class="w-full h-full object-cover" />
                            <span v-else>{{ getInitials(profileData.ownerName) }}</span>
                        </div>
                        <div class="pb-1">
                            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">{{ profileData.umkmName }}</h2>
                            <p class="text-xs text-slate-500 mt-0.5 capitalize">
                                Founder & Owner: <span class="font-bold text-slate-700">{{ profileData.ownerName
                                    }}</span> ·
                                {{ profileData.role }}
                            </p>
                        </div>
                    </div>

                    <router-link to="/profile/edit"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 w-full sm:w-auto">
                        ✏️ Edit Profile
                    </router-link>
                </div>
            </div>

            <!-- Corporate & Founder Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Entity Details -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div
                            class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            🏢
                        </div>
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Corporate Entity Details
                        </h3>
                    </div>

                    <div class="space-y-3 text-xs">
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">REGISTERED BUSINESS NAME</p>
                            <p class="font-bold text-slate-800 mt-0.5">{{ profileData.umkmName }}</p>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">HEADQUARTERS & STORE ADDRESS</p>
                            <p class="font-medium text-slate-700 mt-0.5">{{ profileData.umkmAddress }}</p>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">INITIAL BUSINESS CAPITAL</p>
                            <p class="text-base font-extrabold text-indigo-600 mt-0.5">{{
                                formatCurrency(profileData.modalAwal) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Founder Credentials -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div
                            class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            👤
                        </div>
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Founder Contact &
                            Credentials</h3>
                    </div>

                    <div class="space-y-3 text-xs">
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">FOUNDER NAME</p>
                            <p class="font-bold text-slate-800 mt-0.5">{{ profileData.ownerName }}</p>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">USERNAME</p>
                            <p class="font-semibold text-slate-700 mt-0.5">@{{ profileData.username }}</p>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">DIRECT PHONE NUMBER</p>
                            <p class="font-semibold text-slate-700 mt-0.5">{{ profileData.ownerPhone }}</p>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">MASTER WORKSPACE EMAIL</p>
                            <p class="font-semibold text-slate-700 mt-0.5">{{ profileData.email }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
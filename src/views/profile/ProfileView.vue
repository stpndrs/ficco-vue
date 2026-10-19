<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const profileData = ref({
    id: '',
    umkmName: 'Artisan Coffee Roasters & Cafe',
    umkmAddress: '104 Pike Street, Suite 400, Seattle, WA 98101, United States',
    ownerName: 'Jordan Miles',
    ownerPhone: '+1 (206) 555-0192',
    email: 'jordan@artisancoffee.com',
    modalAwal: '$50,000',
    profileImage: '',
    role: 'Master Administrator'
})

const isLoading = ref(true)

const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token')
        // ID didapatkan dari user context/localStorage
        const userId = localStorage.getItem('userId') || '1'
        const res = await axios.get(`http://localhost:5000/api/user/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            const d = res.data.data
            profileData.value = {
                id: d.id || userId,
                umkmName: d.umkmName || 'Artisan Coffee Roasters & Cafe',
                umkmAddress: d.umkmAddress || '104 Pike Street, Suite 400, Seattle, WA 98101',
                ownerName: d.ownerName || d.user?.name || 'Jordan Miles',
                ownerPhone: d.ownerPhone || d.user?.phone || '+1 (206) 555-0192',
                email: d.email || d.user?.email || 'jordan@artisancoffee.com',
                modalAwal: d.modalAwal ? `$${Number(d.modalAwal).toLocaleString()}` : '$50,000',
                profileImage: d.profileImage || '',
                role: d.user?.role || 'Master Administrator'
            }
        }
    } catch (err) {
        console.error('Failed to load profile:', err)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchProfile)
</script>

<template>
    <div class="max-w-4xl mx-auto text-left space-y-6">
        <!-- Profile Banner & Main Card -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div class="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700"></div>

            <div class="px-8 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mt-12">
                <div class="flex items-end gap-4">
                    <div
                        class="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-white shadow-xl overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-2xl">
                        <img v-if="profileData.profileImage" :src="profileData.profileImage"
                            class="w-full h-full object-cover" />
                        <span v-else>JM</span>
                    </div>
                    <div class="pb-1">
                        <h2 class="text-xl font-extrabold text-slate-900">{{ profileData.umkmName }}</h2>
                        <p class="text-xs text-slate-500 mt-0.5">
                            Founder & Owner: <span class="font-bold text-slate-700">{{ profileData.ownerName }}</span> ·
                            {{ profileData.role }}
                        </p>
                    </div>
                </div>

                <router-link to="/profile/edit"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5">
                    ✏️ Edit Profile
                </router-link>
            </div>
        </div>

        <!-- Corporate Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Entity Details -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div
                        class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        🏢</div>
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Corporate Entity Details</h3>
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
                        <p class="text-base font-extrabold text-indigo-600 mt-0.5">{{ profileData.modalAwal }}</p>
                    </div>
                </div>
            </div>

            <!-- Founder Credentials -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div
                        class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        👤</div>
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Founder Contact & Credentials
                    </h3>
                </div>

                <div class="space-y-3 text-xs">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">FOUNDER NAME</p>
                        <p class="font-bold text-slate-800 mt-0.5">{{ profileData.ownerName }}</p>
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
    </div>
</template>
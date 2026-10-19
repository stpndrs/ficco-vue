<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const search = ref('')
const limit = ref(5)
const isLoading = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchUsers = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/users?limit=${limit.value}`
        if (search.value) url += `&search=${search.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            users.value = res.data.data
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat daftar pengguna', 'error')
    } finally {
        isLoading.value = false
    }
}

const toggleUserStatus = async (user) => {
    try {
        const token = localStorage.getItem('token')
        const newStatus = !user.isActive
        const res = await axios.patch(
            `${import.meta.env.VITE_APP_API_URL}/api/users/${user.id}/status`,
            { isActive: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.data.status) {
            user.isActive = newStatus
            showToast(`Status user diubah menjadi ${newStatus ? 'Active' : 'Inactive'}`)
        }
    } catch (err) {
        showToast('Gagal mengubah status pengguna', 'error')
    }
}

onMounted(fetchUsers)
</script>

<template>
    <div class="space-y-6 text-left relative">
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Filter & Action Bar -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="relative w-full sm:w-96">
                <input v-model="search" @input="fetchUsers" type="text"
                    placeholder="Search staff by name, email, or username..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span>Show:</span>
                    <select v-model="limit" @change="fetchUsers"
                        class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option :value="5">5 per page</option>
                        <option :value="10">10 per page</option>
                        <option :value="25">25 per page</option>
                    </select>
                </div>

                <router-link to="/users/create"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
                    <span>+</span> Add New User
                </router-link>
            </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4">STAFF MEMBER</th>
                        <th class="py-3.5 px-4">USERNAME</th>
                        <th class="py-3.5 px-4">WORK EMAIL</th>
                        <th class="py-3.5 px-4">CONTACT PHONE</th>
                        <th class="py-3.5 px-4">ROLE</th>
                        <th class="py-3.5 px-4">STATUS</th>
                        <th class="py-3.5 px-4 text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="7" class="py-8 text-center text-slate-400">Loading staff accounts...</td>
                    </tr>
                    <tr v-else-if="users.length === 0">
                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada akun staff terdaftar.</td>
                    </tr>
                    <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 transition">
                        <td class="py-3 px-4 flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {{ user.name ? user.name.substring(0, 2).toUpperCase() : 'JO' }}
                            </div>
                            <span class="font-bold text-slate-800">{{ user.name }}</span>
                        </td>
                        <td class="py-3 px-4 font-mono text-slate-500">@{{ user.username }}</td>
                        <td class="py-3 px-4 text-slate-600 font-medium">{{ user.email }}</td>
                        <td class="py-3 px-4 text-slate-600">{{ user.phone || '+1 (206) 555-0192' }}</td>
                        <td class="py-3 px-4">
                            <span :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                                user.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            ]">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <button @click="toggleUserStatus(user)" :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition',
                                user.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                            ]">
                                ● {{ user.isActive !== false ? 'Active' : 'Inactive' }}
                            </button>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <router-link :to="`/users/edit/${user.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                ✏️ Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <p>Showing {{ users.length }} staff accounts</p>
                <div class="flex items-center gap-2">
                    <button disabled class="px-3 py-1.5 border border-slate-200 rounded-lg opacity-40">Previous</button>
                    <button disabled class="px-3 py-1.5 border border-slate-200 rounded-lg opacity-40">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>
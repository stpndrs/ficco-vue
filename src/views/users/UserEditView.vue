<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const form = ref({
    id: '',
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'Admin'
})

const fetchUser = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:5000/api/users/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const u = res.data.data
            form.value = {
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                password: '',
                phone: u.phone || '',
                role: u.role || 'Admin'
            }
        }
    } catch (err) {
        alert('Gagal mengambil data user')
    }
}

onMounted(fetchUser)

const handleSaveChanges = async () => {
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            name: form.value.name,
            username: form.value.username,
            email: form.value.email,
            phone: form.value.phone,
            role: form.value.role
        }
        if (form.value.password) payload.password = form.value.password

        const res = await axios.put(`http://localhost:5000/api/users/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/users')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui data user')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-lg font-bold text-slate-900">Update User: @{{ form.username }}</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">UPDATE
                            USER</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">Configure user credentials and assign role permissions.</p>
                </div>
                <router-link to="/users"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Full Staff Name *</label>
                    <input v-model="form.name" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Access Password</label>
                    <input v-model="form.password" type="password" placeholder="Leave empty to keep existing password"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Username Handle *</label>
                    <input v-model="form.username" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Staff Contact Phone</label>
                    <input v-model="form.phone" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Corporate Email *</label>
                    <input v-model="form.email" type="email"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Workspace Access Role *</label>
                    <select v-model="form.role"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option value="Admin">Admin</option>
                        <option value="Cashier">Cashier</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/users"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSaveChanges" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Changes
                </button>
            </div>
        </div>
    </div>
</template>
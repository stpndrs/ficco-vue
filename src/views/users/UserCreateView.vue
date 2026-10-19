<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isSubmitting = ref(false)

const form = ref({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'Cashier'
})

const handleSave = async () => {
    if (!form.value.name || !form.value.username || !form.value.email || !form.value.password) {
        return alert('Harap isi seluruh field bertanda bintang (*)!')
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/users`, form.value, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/users')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal meregister pengguna baru')
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
                        <h2 class="text-lg font-bold text-slate-900">Register Staff Account</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">NEW
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
                    <input v-model="form.name" type="text" placeholder="e.g. Sarah Jenkins"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Access Password *</label>
                    <input v-model="form.password" type="password" placeholder="Create password (min. 8 characters)"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Username Handle *</label>
                    <input v-model="form.username" type="text" placeholder="sarah_cashier"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Staff Contact Phone</label>
                    <input v-model="form.phone" type="text" placeholder="+1 (206) 555-7140"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Corporate Email *</label>
                    <input v-model="form.email" type="email" placeholder="sarah@artisancoffee.com"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Workspace Access Role *</label>
                    <select v-model="form.role"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option value="Admin">Admin</option>
                        <option value="Cashier">Cashier</option>
                    </select>
                    <p class="text-[10px] text-slate-400 mt-1">Admin: Full management. Cashier: Point of Sale counter.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/users"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSave" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Staff Account
                </button>
            </div>
        </div>
    </div>
</template>
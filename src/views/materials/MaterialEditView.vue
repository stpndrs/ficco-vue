<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const form = ref({
    id: '',
    code: '',
    name: '',
    type: 'Raw Material',
    description: ''
})

const fetchMaterial = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/materials/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const m = res.data.data
            form.value = {
                id: m.id,
                code: m.code || `MAT-${m.id.substring(0, 3)}`,
                name: m.name,
                type: m.type || m.classification || 'Raw Material',
                description: m.description || m.notes || ''
            }
        }
    } catch (err) {
        alert('Gagal mengambil data material')
    }
}

onMounted(fetchMaterial)

const handleSaveChanges = async () => {
    if (!form.value.name) return alert('Nama material wajib diisi!')
    isSubmitting.value = true

    try {
        const token = localStorage.getItem('token')
        const payload = {
            name: form.value.name,
            type: form.value.type,
            description: form.value.description
        }

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/materials/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/materials')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui material')
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
                    <h2 class="text-lg font-bold text-slate-900">Edit Material: {{ form.code }}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Update classification, name, or material specifications.
                    </p>
                </div>
                <router-link to="/materials"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back to Catalog
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Material Code (ReadOnly)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Material Name *</label>
                    <input v-model="form.name" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Material Classification *</label>
                    <select v-model="form.type"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option value="baku">Raw Material (Bahan Baku)</option>
                        <option value="penolong">Auxiliary Material (Bahan Penolong)</option>
                    </select>
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Description & Quality Specs</label>
                    <textarea v-model="form.description" rows="3"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/materials"
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
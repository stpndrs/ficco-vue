<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// --- STATE DATA ---
const materials = ref([])
const isLoading = ref(false)

// --- FILTERS (FR-0206 & FR-0207) ---
const search = ref('')
const selectedType = ref('All Types')
const selectedDate = ref('All Dates')

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH MATERIALS (FR-0204 & FR-0205) ---
const fetchMaterials = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/materials?limit=50`
        if (search.value) url += `&search=${search.value}`
        if (selectedType.value !== 'All Types') url += `&type=${selectedType.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            materials.value = res.data.data
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat daftar bahan baku', 'error')
    } finally {
        isLoading.value = false
    }
}

// --- TOGGLE STATUS (FR-0210) ---
const toggleStatus = async (item) => {
    try {
        const token = localStorage.getItem('token')
        const newStatus = !item.isActive
        const res = await axios.patch(
            `${import.meta.env.VITE_APP_API_URL}/api/materials/${item.id}/status`,
            { isActive: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.data.status) {
            item.isActive = newStatus
            showToast(`Status material diubah menjadi ${newStatus ? 'Active' : 'Inactive'}`)
        }
    } catch (err) {
        showToast('Gagal mengubah status material', 'error')
    }
}

onMounted(fetchMaterials)
</script>

<template>
    <div class="space-y-6 text-left relative">
        <!-- Toast Alert -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Filter & Action Bar (Presisi Mockup FR-0206 - FR-0208) -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <!-- Search Field -->
            <div class="relative w-full sm:w-96">
                <input v-model="search" @input="fetchMaterials" type="text"
                    placeholder="Search material code or name..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <!-- Filters & Add Button -->
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select v-model="selectedType" @change="fetchMaterials"
                    class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
                    <option value="All Types">All Types</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Auxiliary Material">Auxiliary Material</option>
                    <option value="Packaging">Packaging</option>
                </select>

                <select v-model="selectedDate"
                    class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
                    <option value="All Dates">All Dates</option>
                    <option value="This Month">This Month</option>
                </select>

                <router-link to="/materials/create"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
                    <span>+</span> Add Material
                </router-link>
            </div>
        </div>

        <!-- Materials Data Table (Presisi Mockup FR-0205) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4">MATERIAL CODE</th>
                        <th class="py-3.5 px-4">MATERIAL NAME</th>
                        <th class="py-3.5 px-4">MATERIAL CLASSIFICATION</th>
                        <th class="py-3.5 px-4">DESCRIPTION & NOTES</th>
                        <th class="py-3.5 px-4">STATUS</th>
                        <th class="py-3.5 px-4 text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="6" class="py-8 text-center text-slate-400">Loading materials catalog...</td>
                    </tr>
                    <tr v-else-if="materials.length === 0">
                        <td colspan="6" class="py-8 text-center text-slate-400">Belum ada bahan baku atau material
                            terdaftar.</td>
                    </tr>
                    <tr v-for="mat in materials" :key="mat.id" class="hover:bg-slate-50/50 transition">
                        <!-- Material Code -->
                        <td class="py-3.5 px-4 font-bold text-indigo-600">
                            {{ mat.code || `MAT-${mat.id.substring(0, 3).toUpperCase()}` }}
                        </td>

                        <!-- Material Name -->
                        <td class="py-3.5 px-4 font-bold text-slate-800">
                            {{ mat.name }}
                        </td>

                        <!-- Material Classification -->
                        <td class="py-3.5 px-4">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                                {{ mat.type || mat.classification || 'Raw Material' }}
                            </span>
                        </td>

                        <!-- Description & Notes -->
                        <td class="py-3.5 px-4 text-slate-500 font-medium line-clamp-1 max-w-xs">
                            {{ mat.description || mat.notes || 'Grade 1 washed green beans for specialty espresso                            roast.' }}
                        </td>

                        <!-- Status Toggle (FR-0210) -->
                        <td class="py-3.5 px-4">
                            <button @click="toggleStatus(mat)" :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition inline-flex items-center gap-1',
                                mat.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            ]">
                                ● {{ mat.isActive !== false ? 'Active' : 'Inactive' }}
                            </button>
                        </td>

                        <!-- Actions (FR-0209) -->
                        <td class="py-3.5 px-4 text-right">
                            <router-link :to="`/materials/edit/${mat.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
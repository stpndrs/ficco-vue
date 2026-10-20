<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

// --- STATE DATA ---
const materials = ref([])
const isLoading = ref(false)

// --- FILTERS & PAGINATION PARAMS (Sesuai Query Params Endpoint) ---
const search = ref('')
const selectedType = ref('All')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const limit = ref(10)

// Options untuk Filter Tipe Material
const typeOptions = [
    { id: 'All', name: 'All Types' },
    { id: 'baku', name: 'Bahan Baku (baku)' },
    { id: 'penolong', name: 'Bahan Penolong (penolong)' }
]

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH MATERIALS (GET /api/materials) ---
const fetchMaterials = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/materials?page=${currentPage.value}&limit=${limit.value}`

        if (search.value) url += `&search=${encodeURIComponent(search.value)}`
        if (selectedType.value !== 'All') url += `&type=${selectedType.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            materials.value = res.data.data || []
            if (res.data.meta) {
                totalPages.value = Number(res.data.meta.totalPages) || 1
                totalItems.value = Number(res.data.meta.total) || materials.value.length
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat daftar bahan baku', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchMaterials(1)
}

const resetFilters = () => {
    search.value = ''
    selectedType.value = 'All'
    fetchMaterials(1)
}

// --- TOGGLE STATUS ---
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

onMounted(() => {
    fetchMaterials(1)
})
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
        <!-- Toast Alert -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Filter & Action Bar Responsive -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
                <!-- Search Field -->
                <div class="w-full xl:w-80">
                    <BaseInput v-model="search" placeholder="Search material code or name..."
                        @input="handleFilterChange" />
                </div>

                <!-- Type Filter -->
                <div class="w-full sm:w-48">
                    <BaseSelect v-model="selectedType" :options="typeOptions" valueKey="id" labelKey="name"
                        @change="handleFilterChange" />
                </div>

                <!-- Add Button -->
                <router-link to="/materials/create"
                    class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto">
                    <span>+</span> Add Material
                </router-link>
            </div>
        </div>

        <!-- Materials Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 whitespace-nowrap">MATERIAL CODE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">MATERIAL NAME</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">CLASSIFICATION</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STOCK</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">DESCRIPTION & NOTES</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="7" class="py-8 text-center text-slate-400">Loading materials catalog...</td>
                    </tr>
                    <tr v-else-if="materials.length === 0">
                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada bahan baku atau material
                            terdaftar.</td>
                    </tr>
                    <tr v-for="mat in materials" :key="mat.id" class="hover:bg-slate-50/50 transition">
                        <!-- Material Code -->
                        <td class="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">
                            {{ mat.code || `MAT-${mat.id.substring(0, 3).toUpperCase()}` }}
                        </td>

                        <!-- Material Name -->
                        <td class="py-3.5 px-4 font-bold text-slate-800">
                            {{ mat.name }}
                        </td>

                        <!-- Material Classification Badge -->
                        <td class="py-3.5 px-4 whitespace-nowrap">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60 capitalize">
                                {{ mat.type || 'baku' }}
                            </span>
                        </td>

                        <!-- Stock -->
                        <td class="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                            {{ mat.stock ?? 0 }}
                        </td>

                        <!-- Description & Notes -->
                        <td class="py-3.5 px-4 text-slate-500 font-medium line-clamp-1 max-w-xs">
                            {{ mat.description || '-' }}
                        </td>

                        <!-- Status Toggle -->
                        <td class="py-3.5 px-4 whitespace-nowrap">
                            <button @click="toggleStatus(mat)" :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition inline-flex items-center gap-1',
                                mat.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            ]">
                                ● {{ mat.isActive !== false ? 'Active' : 'Inactive' }}
                            </button>
                        </td>

                        <!-- Actions -->
                        <td class="py-3.5 px-4 text-right whitespace-nowrap">
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

            <!-- Pagination Connected to API Meta -->
            <div
                class="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ materials.length }} of {{ totalItems }} materials</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchMaterials(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading" @click="fetchMaterials(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
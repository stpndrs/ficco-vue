<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'

// --- STATE DATA ---
const productionBatches = ref([])
const isLoading = ref(false)

// --- FILTERS & PAGINATION PARAMS ---
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const limit = ref(10)

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH PRODUCTION BATCHES (GET /api/production) ---
const fetchProductionBatches = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/production?page=${currentPage.value}&limit=${limit.value}`

        if (search.value) url += `&search=${encodeURIComponent(search.value)}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            productionBatches.value = res.data.data || []
            if (res.data.meta) {
                totalPages.value = Number(res.data.meta.totalPages) || 1
                totalItems.value = Number(res.data.meta.total) || productionBatches.value.length
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat log produksi', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchProductionBatches(1)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toISOString().split('T')[0]
}

onMounted(() => {
    fetchProductionBatches(1)
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

        <!-- Filter & Action Bar -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <!-- Search Field -->
            <div class="w-full sm:w-80">
                <BaseInput v-model="search" placeholder="Search batch code or description..."
                    @input="handleFilterChange" />
            </div>

            <!-- Add Button -->
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                <router-link to="/production/create"
                    class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto">
                    <span>+</span> Log Production Batch
                </router-link>
            </div>
        </div>

        <!-- Production Batches Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 whitespace-nowrap">BATCH CODE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">PRODUCTION DATE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">YIELD QTY</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">UNIT</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">DESCRIPTION</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">NOTES</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="7" class="py-8 text-center text-slate-400">Loading production log...</td>
                    </tr>
                    <tr v-else-if="productionBatches.length === 0">
                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada catatan batch produksi.</td>
                    </tr>
                    <tr v-for="batch in productionBatches" :key="batch.id" class="hover:bg-slate-50/50 transition">
                        <!-- Batch Code -->
                        <td class="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">
                            {{ batch.code }}
                        </td>

                        <!-- Production Date -->
                        <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {{ formatDate(batch.date || batch.createdAt) }}
                        </td>

                        <!-- Yield Qty -->
                        <td class="py-3.5 px-4 font-extrabold text-emerald-600 whitespace-nowrap">
                            +{{ batch.qtyResult }}
                        </td>

                        <!-- Unit -->
                        <td class="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {{ batch.unit?.name || 'Pcs' }}
                        </td>

                        <!-- Description -->
                        <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                            {{ batch.description || '-' }}
                        </td>

                        <!-- Notes -->
                        <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {{ batch.notes || '-' }}
                        </td>

                        <!-- Actions -->
                        <td class="py-3.5 px-4 text-right whitespace-nowrap">
                            <router-link :to="`/production/edit/${batch.id}`"
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
                <p>Showing {{ productionBatches.length }} of {{ totalItems }} production batches</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchProductionBatches(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading"
                        @click="fetchProductionBatches(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
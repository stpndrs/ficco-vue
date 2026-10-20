<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

// --- STATE DATA ---
const expenses = ref([])
const isLoading = ref(false)

// --- FILTERS & PAGINATION PARAMS ---
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const totalItems = ref(0)

// --- MODAL PREVIEW IMAGE STATE ---
const previewImageUrl = ref(null)

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH OPERATIONALS (GET /api/operationals) ---
const fetchExpenses = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        const params = {
            page: currentPage.value,
            limit: limit.value
        }

        if (search.value) params.search = search.value
        if (startDate.value) params.startDate = startDate.value
        if (endDate.value) params.endDate = endDate.value

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/operationals`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        })

        if (res.data.status) {
            expenses.value = res.data.data || []
            if (res.data.meta) {
                totalPages.value = Number(res.data.meta.totalPages) || 1
                totalItems.value = Number(res.data.meta.total) || expenses.value.length
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat catatan pengeluaran operasional', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchExpenses(1)
}

const resetFilters = () => {
    search.value = ''
    startDate.value = ''
    endDate.value = ''
    fetchExpenses(1)
}

const resolveImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${import.meta.env.VITE_APP_API_URL}${path}`
}

const openPreviewModal = (path) => {
    previewImageUrl.value = resolveImageUrl(path)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toISOString().split('T')[0]
}

onMounted(() => {
    fetchExpenses(1)
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
                <!-- Search Input -->
                <div class="w-full xl:w-80">
                    <BaseInput v-model="search" placeholder="Search by code or title..." @input="handleFilterChange" />
                </div>

                <!-- Date Range Filters Group -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <div class="w-full sm:w-36">
                            <BaseInput v-model="startDate" type="date" placeholder="Start Date"
                                @change="handleFilterChange" />
                        </div>
                        <span class="text-slate-400 text-xs">-</span>
                        <div class="w-full sm:w-36">
                            <BaseInput v-model="endDate" type="date" placeholder="End Date"
                                @change="handleFilterChange" />
                        </div>
                    </div>

                    <button v-if="startDate || endDate || search" @click="resetFilters"
                        class="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 underline transition shrink-0">
                        Reset
                    </button>
                </div>

                <!-- Add Button -->
                <router-link to="/operationals/create"
                    class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto">
                    <span>+</span> Log Expense
                </router-link>
            </div>
        </div>

        <!-- Operating Expenses Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 whitespace-nowrap">EXPENSE CODE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">EXPENSE TITLE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">DATE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">AMOUNT</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">RECEIPT PROOF</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">NOTES</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="7" class="py-8 text-center text-slate-400">Memuat catatan pengeluaran
                            operasional...</td>
                    </tr>
                    <tr v-else-if="expenses.length === 0">
                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada catatan pengeluaran
                            operasional.</td>
                    </tr>
                    <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-slate-50/50 transition">
                        <!-- Expense Code -->
                        <td class="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">
                            {{ exp.code }}
                        </td>

                        <!-- Expense Title -->
                        <td class="py-3.5 px-4 font-bold text-slate-800">
                            {{ exp.title }}
                        </td>

                        <!-- Date -->
                        <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {{ formatDate(exp.date) }}
                        </td>

                        <!-- Amount -->
                        <td class="py-3.5 px-4 font-extrabold text-red-600 whitespace-nowrap">
                            {{ formatCurrency(exp.amount) }}
                        </td>

                        <!-- Receipt Proof -->
                        <td class="py-3.5 px-4 whitespace-nowrap">
                            <div v-if="exp.paymentProof" class="flex items-center gap-2">
                                <img :src="resolveImageUrl(exp.paymentProof)" alt="Proof Thumbnail"
                                    class="w-8 h-8 object-cover rounded-lg border border-slate-200 cursor-pointer"
                                    @click="openPreviewModal(exp.paymentProof)" />
                                <button type="button" @click="openPreviewModal(exp.paymentProof)"
                                    class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1">
                                    👁 View
                                </button>
                            </div>
                            <span v-else class="text-slate-400 text-[10px] italic">No receipt</span>
                        </td>

                        <!-- Notes -->
                        <td class="py-3.5 px-4 text-slate-500 font-medium line-clamp-1 max-w-xs">
                            {{ exp.notes || '-' }}
                        </td>

                        <!-- Actions -->
                        <td class="py-3.5 px-4 text-right whitespace-nowrap">
                            <router-link :to="`/operationals/edit/${exp.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                ✏️ Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Connected to API Meta -->
            <div
                class="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ expenses.length }} of {{ totalItems }} operational expenses</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchExpenses(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading" @click="fetchExpenses(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Receipt Image Preview Modal -->
        <div v-if="previewImageUrl"
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            @click.self="previewImageUrl = null">
            <div class="bg-white p-5 rounded-3xl max-w-lg w-full space-y-4 text-center relative shadow-2xl my-auto">
                <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 class="text-sm font-bold text-slate-800">Bukti Pembayaran / Nota</h3>
                    <button @click="previewImageUrl = null"
                        class="text-slate-400 hover:text-slate-600 font-bold p-1">&times;</button>
                </div>
                <div class="max-h-[70vh] overflow-auto rounded-xl border border-slate-100">
                    <img :src="previewImageUrl" alt="Receipt Full Preview"
                        class="w-full h-auto object-contain rounded-xl" />
                </div>
                <div class="flex justify-end">
                    <a :href="previewImageUrl" target="_blank"
                        class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition">
                        Buka Tab Baru ↗
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
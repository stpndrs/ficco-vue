<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// --- STATE DATA ---
const expenses = ref([])
const isLoading = ref(false)

// --- FILTERS & PAGINATION (queryOperationalSchema) ---
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

// --- FETCH OPERATIONALS ---
const fetchExpenses = async () => {
    isLoading.value = true
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
            expenses.value = res.data.data
            if (res.data.meta) {
                totalPages.value = res.data.meta.totalPages
                totalItems.value = res.data.meta.total
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat catatan pengeluaran operasional', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    currentPage.value = 1
    fetchExpenses()
}

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchExpenses()
    }
}

const resolveImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${import.meta.env.VITE_APP_API_URL}${path}`
}

const openPreviewModal = (path) => {
    previewImageUrl.value = resolveImageUrl(path)
}

onMounted(fetchExpenses)

const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`
</script>

<template>
    <div class="space-y-6 text-left relative">
        <!-- Toast Notification -->
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
            <!-- Search & Date Range Filter -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                <div class="relative w-full sm:w-64">
                    <input v-model="search" @input="handleFilterChange" type="text"
                        placeholder="Cari kode atau judul..."
                        class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <span class="text-xs font-semibold text-slate-400 shrink-0">Dari:</span>
                    <input v-model="startDate" @change="handleFilterChange" type="date"
                        class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600" />

                    <span class="text-xs font-semibold text-slate-400 shrink-0">Sampai:</span>
                    <input v-model="endDate" @change="handleFilterChange" type="date"
                        class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600" />
                </div>
            </div>

            <!-- Add Button -->
            <router-link to="/operationals/create"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
                <span>+</span> Log Expense
            </router-link>
        </div>

        <!-- Operating Expenses Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4">EXPENSE CODE</th>
                        <th class="py-3.5 px-4">EXPENSE TITLE</th>
                        <th class="py-3.5 px-4">DATE</th>
                        <th class="py-3.5 px-4">AMOUNT</th>
                        <th class="py-3.5 px-4">RECEIPT PROOF</th>
                        <th class="py-3.5 px-4">NOTES</th>
                        <th class="py-3.5 px-4 text-right">ACTIONS</th>
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
                        <td class="py-3.5 px-4 font-bold text-indigo-600">
                            {{ exp.code }}
                        </td>

                        <!-- Expense Title -->
                        <td class="py-3.5 px-4 font-bold text-slate-800">
                            {{ exp.title }}
                        </td>

                        <!-- Date -->
                        <td class="py-3.5 px-4 text-slate-600 font-medium">
                            {{ new Date(exp.date).toISOString().split('T')[0] }}
                        </td>

                        <!-- Amount -->
                        <td class="py-3.5 px-4 font-extrabold text-red-600">
                            {{ formatCurrency(exp.amount) }}
                        </td>

                        <!-- Receipt Proof -->
                        <td class="py-3.5 px-4">
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
                        <td class="py-3.5 px-4 text-right space-x-1.5">
                            <router-link :to="`/operationals/edit/${exp.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                ✏️ Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Bar -->
            <div v-if="totalPages > 1"
                class="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Menampilkan Halaman {{ currentPage }} dari {{ totalPages }} (Total {{ totalItems }} data)</span>
                <div class="flex items-center gap-1">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium">
                        Sebelumnya
                    </button>
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium">
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>

        <!-- Receipt Image Preview Modal -->
        <div v-if="previewImageUrl"
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            @click.self="previewImageUrl = null">
            <div class="bg-white p-4 rounded-3xl max-w-lg w-full space-y-4 text-center relative shadow-2xl">
                <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 class="text-sm font-bold text-slate-800">Bukti Pembayaran / Nota</h3>
                    <button @click="previewImageUrl = null"
                        class="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
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
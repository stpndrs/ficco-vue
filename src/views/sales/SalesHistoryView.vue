<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

const transactions = ref([])
const isLoading = ref(false)

// Filter & Pagination Params (OpenAPI Schema)[cite: 47]
const search = ref('')
const statusFilter = ref('All')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const limit = ref(10)

const selectedTx = ref(null)
const showDetailModal = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchTransactions = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/sales?page=${currentPage.value}&limit=${limit.value}`

        if (search.value) url += `&search=${encodeURIComponent(search.value)}`
        if (statusFilter.value !== 'All') url += `&status=${statusFilter.value}`

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })

        if (res.data.status) {
            transactions.value = res.data.data || []
            if (res.data.meta) {
                totalPages.value = Number(res.data.meta.totalPages) || 1
                totalItems.value = Number(res.data.meta.total) || transactions.value.length
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat riwayat transaksi', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchTransactions(1)
}

const openDetails = async (id) => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/sales/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) {
            selectedTx.value = res.data.data
            showDetailModal.value = true
        }
    } catch (err) {
        showToast('Gagal mengambil detail transaksi', 'error')
    }
}

const cancelTx = async (id) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return
    try {
        const token = localStorage.getItem('token')
        const res = await axios.patch(`${import.meta.env.VITE_APP_API_URL}/api/sales/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) {
            showToast('Transaksi berhasil dibatalkan')
            fetchTransactions(currentPage.value)
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal membatalkan transaksi', 'error')
    }
}

onMounted(() => {
    fetchTransactions(1)
})
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
        <!-- Toast Notification -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Nav Tabs -->
        <div class="flex items-center gap-2">
            <router-link to="/sales"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50">
                + New Order
            </router-link>
            <router-link to="/sales/history"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-200">
                Transaction History
            </router-link>
        </div>

        <!-- Filter Card -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div class="w-full sm:w-80">
                <BaseInput v-model="search" placeholder="Search transaction code or customer..."
                    @input="handleFilterChange" />
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div class="w-full sm:w-44">
                    <BaseSelect v-model="statusFilter" :options="[
                        { id: 'All', name: 'All Statuses' },
                        { id: 'Draft', name: 'Draft' },
                        { id: 'Pending', name: 'Pending' },
                        { id: 'Paid', name: 'Paid' },
                        { id: 'Done', name: 'Done' },
                        { id: 'Cancel', name: 'Cancel' }
                    ]" @change="handleFilterChange" />
                </div>

                <router-link to="/sales"
                    class="px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 shrink-0 flex items-center justify-center">
                    + Create Order
                </router-link>
            </div>
        </div>

        <!-- Data Table Responsive -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase">
                        <th class="py-3.5 px-4 whitespace-nowrap">Transaction Code</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">Customer Name</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">Date & Method</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">Total</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">Payment Status</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="6" class="py-8 text-center text-slate-400">Loading sales transactions...</td>
                    </tr>
                    <tr v-else-if="transactions.length === 0">
                        <td colspan="6" class="py-8 text-center text-slate-400">Belum ada riwayat transaksi.</td>
                    </tr>
                    <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50/50 transition">
                        <td class="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">{{ tx.code }}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-800">
                            {{ tx.customerName || 'Walk-in Guest' }}
                            <p v-if="tx.customerPhone" class="text-[10px] text-slate-400 font-normal">{{
                                tx.customerPhone }}</p>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {{ new Date(tx.createdAt).toLocaleDateString() }}
                            <p class="text-[10px] text-slate-400 capitalize">{{ tx.paymentMethod }}</p>
                        </td>
                        <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{{
                            formatCurrency(tx.totalPrice) }}</td>
                        <td class="py-3.5 px-4 whitespace-nowrap">
                            <span :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold capitalize',
                                tx.status?.toLowerCase() === 'paid' || tx.status?.toLowerCase() === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                    tx.status?.toLowerCase() === 'draft' || tx.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            ]">
                                ● {{ tx.status }}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button @click="openDetails(tx.id)"
                                class="px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition">Details</button>
                            <router-link v-if="tx.status?.toLowerCase() === 'draft'" :to="`/sales/edit/${tx.id}`"
                                class="px-2.5 py-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition">Edit</router-link>
                            <button v-if="tx.status?.toLowerCase() === 'draft'" @click="cancelTx(tx.id)"
                                class="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition">Cancel</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Bar -->
            <div
                class="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ transactions.length }} of {{ totalItems }} transactions</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchTransactions(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading"
                        @click="fetchTransactions(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Teleport Modal to Body -->
        <Teleport to="body">
            <div v-if="showDetailModal && selectedTx"
                class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div
                    class="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 text-left relative my-auto">
                    <button @click="showDetailModal = false"
                        class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>

                    <div>
                        <h3 class="text-base font-bold text-slate-900">Order Details #{{ selectedTx.code }}</h3>
                        <p class="text-xs text-slate-400">Recorded on {{ new
                            Date(selectedTx.createdAt).toLocaleDateString() }} - Method: {{ selectedTx.paymentMethod }}
                        </p>
                    </div>

                    <div
                        class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div>
                            <p class="text-xs font-bold text-slate-800">{{ selectedTx.customerName || 'Walk-in Guest' }}
                            </p>
                            <p class="text-[10px] text-slate-400">{{ selectedTx.customerPhone || '-' }}</p>
                        </div>
                        <span
                            class="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full capitalize">●
                            {{ selectedTx.status }}</span>
                    </div>

                    <div class="border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                <tr>
                                    <th class="p-2.5">Item</th>
                                    <th class="p-2.5 text-center">Qty</th>
                                    <th class="p-2.5 text-right">Price</th>
                                    <th class="p-2.5 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="d in selectedTx.saleDetails" :key="d.id">
                                    <td class="p-2.5 font-semibold text-slate-800">{{ d.product?.name || 'Product Item'
                                    }}</td>
                                    <td class="p-2.5 text-center font-bold text-slate-600">{{ d.qty }}</td>
                                    <td class="p-2.5 text-right text-slate-600">{{ formatCurrency(d.price) }}</td>
                                    <td class="p-2.5 text-right font-bold text-slate-900">{{ formatCurrency(d.subtotal)
                                    }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="space-y-1 text-xs pt-2">
                        <div
                            class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                            <span>Total paid</span><span class="text-indigo-600">{{
                                formatCurrency(selectedTx.totalPrice) }}</span>
                        </div>
                    </div>

                    <button @click="showDetailModal = false"
                        class="w-full py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                        ← Back to Transactions
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>
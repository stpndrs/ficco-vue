<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const transactions = ref([])
const search = ref('')
const statusFilter = ref('All')
const selectedTx = ref(null)
const showDetailModal = ref(false)

const fetchTransactions = async () => {
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/sales?limit=50`
        if (search.value) url += `&search=${search.value}`
        if (statusFilter.value !== 'All') url += `&status=${statusFilter.value}`

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) transactions.value = res.data.data
    } catch (err) {
        console.error('Failed to fetch transactions:', err)
    }
}

onMounted(fetchTransactions)

const openDetails = async (id) => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/sales/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) {
            selectedTx.value = res.data.data
            showDetailModal.value = true
        }
    } catch (err) {
        alert('Gagal mengambil detail transaksi')
    }
}

const cancelTx = async (id) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return
    try {
        const token = localStorage.getItem('token')
        const res = await axios.patch(`${import.meta.env.VITE_APP_API_URL}/api/sales/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) fetchTransactions()
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal membatalkan transaksi')
    }
}

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`
</script>

<template>
    <div class="space-y-6 text-left">
        <!-- Nav Tabs -->
        <div class="flex items-center gap-2">
            <router-link to="/sales"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50">
                + New Order
            </router-link>
            <router-link to="/sales/history"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-200">
                Transaction History ({{ transactions.length }})
            </router-link>
        </div>

        <!-- Filter Card -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <input v-model="search" @input="fetchTransactions" type="text"
                placeholder="Search transaction code or customer name..."
                class="w-full sm:w-80 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />

            <div class="flex items-center gap-2 w-full sm:w-auto">
                <select v-model="statusFilter" @change="fetchTransactions"
                    class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none">
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancel">Cancel</option>
                </select>

                <router-link to="/sales"
                    class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 shrink-0">
                    + Create New Order
                </router-link>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase">
                        <th class="py-3.5 px-4">Transaction Code</th>
                        <th class="py-3.5 px-4">Customer Name</th>
                        <th class="py-3.5 px-4">Date & Method</th>
                        <th class="py-3.5 px-4">Total ($)</th>
                        <th class="py-3.5 px-4">Payment Status</th>
                        <th class="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50/50 transition">
                        <td class="py-3.5 px-4 font-bold text-indigo-600">{{ tx.code }}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-800">
                            {{ tx.customerName || 'Walk-in Guest' }}
                            <p class="text-[10px] text-slate-400 font-normal">{{ tx.customerPhone }}</p>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600">
                            {{ new Date(tx.createdAt).toLocaleDateString() }}
                            <p class="text-[10px] text-slate-400">{{ tx.paymentMethod }}</p>
                        </td>
                        <td class="py-3.5 px-4 font-bold text-slate-900">{{ formatCurrency(tx.totalPrice) }}</td>
                        <td class="py-3.5 px-4">
                            <span
                                :class="['px-2.5 py-1 rounded-full text-[10px] font-bold', tx.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600']">
                                ● {{ tx.status }}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-1">
                            <button @click="openDetails(tx.id)"
                                class="px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Details</button>
                            <router-link v-if="tx.status === 'Draft'" :to="`/sales/edit/${tx.id}`"
                                class="px-2.5 py-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium">Edit</router-link>
                            <button v-if="tx.status !== 'Cancel'" @click="cancelTx(tx.id)"
                                class="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium">Cancel</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Order Details Modal Popup (Presisi Gambar Mockup) -->
        <div v-if="showDetailModal && selectedTx"
            class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                class="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-left relative">
                <button @click="showDetailModal = false"
                    class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>

                <div>
                    <h3 class="text-base font-bold text-slate-900">Order Details #{{ selectedTx.code }}</h3>
                    <p class="text-xs text-slate-400">Recorded on {{ new Date(selectedTx.createdAt).toLocaleDateString()
                    }} - Method: {{ selectedTx.paymentMethod }}</p>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                        <p class="text-xs font-bold text-slate-800">{{ selectedTx.customerName }}</p>
                        <p class="text-[10px] text-slate-400">{{ selectedTx.customerPhone }}</p>
                    </div>
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">● {{
                        selectedTx.status }}</span>
                </div>

                <div class="border border-slate-100 rounded-2xl overflow-hidden">
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
                                <td class="p-2.5 font-semibold text-slate-800">{{ d.product?.name || 'Item' }}</td>
                                <td class="p-2.5 text-center font-bold text-slate-600">{{ d.qty }}</td>
                                <td class="p-2.5 text-right text-slate-600">{{ formatCurrency(d.price) }}</td>
                                <td class="p-2.5 text-right font-bold text-slate-900">{{ formatCurrency(d.subtotal) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="space-y-1 text-xs pt-2">
                    <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{{
                        formatCurrency(selectedTx.totalPrice) }}</span></div>
                    <div class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Paid</span><span class="text-indigo-600">{{ formatCurrency(selectedTx.totalPrice)
                        }}</span>
                    </div>
                </div>

                <button @click="showDetailModal = false"
                    class="w-full py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">
                    ← Back to Transactions
                </button>
            </div>
        </div>
    </div>
</template>
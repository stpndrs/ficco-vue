<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// --- STATE DATA ---
const expenses = ref([])
const isLoading = ref(false)

// --- FILTERS (FR-0260 & FR-0261) ---
const search = ref('')
const dateFilter = ref('')

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH OPERATIONALS (FR-0258 & FR-0259) ---
const fetchExpenses = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('token')
        let url = 'http://localhost:5000/api/operationals?limit=50'
        if (search.value) url += `&search=${search.value}`
        if (dateFilter.value) url += `&date=${dateFilter.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            expenses.value = res.data.data
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat catatan pengeluaran operasional', 'error')
    } finally {
        isLoading.value = false
    }
}

// --- DELETE EXPENSE ACTION ---
const deleteExpense = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan pengeluaran ini?')) return
    try {
        const token = localStorage.getItem('token')
        const res = await axios.delete(`http://localhost:5000/api/operationals/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            showToast('Catatan pengeluaran berhasil dihapus')
            fetchExpenses()
        }
    } catch (err) {
        showToast('Gagal menghapus catatan pengeluaran', 'error')
    }
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

        <!-- Filter & Action Bar (Presisi Mockup FR-0260 - FR-0262) -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <!-- Search & Date Filter -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                <div class="relative w-full sm:w-80">
                    <input v-model="search" @input="fetchExpenses" type="text"
                        placeholder="Search expense code or title..."
                        class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <span class="text-xs font-semibold text-slate-400 shrink-0">Date:</span>
                    <input v-model="dateFilter" @change="fetchExpenses" type="date"
                        class="w-full sm:w-auto px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600" />
                </div>
            </div>

            <!-- Add Button (FR-0262) -->
            <router-link to="/operationals/create"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
                <span>+</span> Log Expense
            </router-link>
        </div>

        <!-- Operating Expenses Data Table (Presisi Mockup FR-0259) -->
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
                        <td colspan="7" class="py-8 text-center text-slate-400">Loading operating expenses...</td>
                    </tr>
                    <tr v-else-if="expenses.length === 0">
                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada catatan pengeluaran
                            operasional.</td>
                    </tr>
                    <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-slate-50/50 transition">
                        <!-- Expense Code -->
                        <td class="py-3.5 px-4 font-bold text-indigo-600">
                            {{ exp.code || `EXP-10${exp.id}` }}
                        </td>

                        <!-- Expense Title -->
                        <td class="py-3.5 px-4 font-bold text-slate-800">
                            {{ exp.title }}
                        </td>

                        <!-- Date -->
                        <td class="py-3.5 px-4 text-slate-600 font-medium">
                            {{ new Date(exp.createdAt || exp.transactionDate).toISOString().split('T')[0] }}
                        </td>

                        <!-- Amount -->
                        <td class="py-3.5 px-4 font-extrabold text-red-600">
                            {{ formatCurrency(exp.amount) }}
                        </td>

                        <!-- Receipt Proof -->
                        <td class="py-3.5 px-4">
                            <a v-if="exp.paymentProof || exp.receiptUrl" :href="exp.paymentProof || exp.receiptUrl"
                                target="_blank"
                                class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1">
                                👁 View Receipt
                            </a>
                            <span v-else class="text-slate-400 text-[10px] italic">No receipt</span>
                        </td>

                        <!-- Notes -->
                        <td class="py-3.5 px-4 text-slate-500 font-medium line-clamp-1 max-w-xs">
                            {{ exp.notes || exp.description || 'Dedicated fiber link and POS cloud subscription.' }}
                        </td>

                        <!-- Actions (FR-0263) -->
                        <td class="py-3.5 px-4 text-right space-x-1.5">
                            <router-link :to="`/operationals/edit/${exp.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                ✏️ Edit
                            </router-link>

                            <button @click="deleteExpense(exp.id)"
                                class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Expense">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
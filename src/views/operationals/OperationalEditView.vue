<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const form = ref({
    id: '',
    code: 'EXP-101',
    title: 'Store Commercial Power & HVAC Utilities',
    amount: 320,
    transactionDate: '2026-10-05',
    paymentProof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
    notes: 'September to October billing cycle for store & roastery.'
})

const fetchExpense = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:5000/api/operationals/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const e = res.data.data
            form.value = {
                id: e.id,
                code: e.code || `EXP-10${e.id}`,
                title: e.title,
                amount: e.amount,
                transactionDate: e.transactionDate ? new Date(e.transactionDate).toISOString().split('T')[0] : '2026-10-05',
                paymentProof: e.paymentProof || e.receiptUrl || '',
                notes: e.notes || e.description || ''
            }
        }
    } catch (err) {
        alert('Gagal mengambil data pengeluaran operasional')
    }
}

onMounted(fetchExpense)

const handleSaveChanges = async () => {
    if (!form.value.title || !form.value.amount) {
        return alert('Judul pengeluaran dan jumlah (amount) wajib diisi!')
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            title: form.value.title,
            amount: Number(form.value.amount),
            transactionDate: form.value.transactionDate,
            paymentProof: form.value.paymentProof || null,
            notes: form.value.notes || null
        }

        const res = await axios.put(`http://localhost:5000/api/operationals/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/operationals')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui pengeluaran operasional')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-lg font-bold text-slate-900">Edit Operating Expense: #{{ form.code }}</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">EDIT
                            RECORD</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">
                        Record recurring overhead costs such as rent, utility bills, employee wages, or software
                        subscriptions.
                    </p>
                </div>
                <router-link to="/operationals"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <!-- Form Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Code (Auto-generated /
                        ReadOnly)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Amount ($) *</label>
                    <input v-model="form.amount" type="number" step="0.01"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Title *</label>
                    <input v-model="form.title" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Payment Receipt / Proof URL
                        (Optional)</label>
                    <div class="space-y-1.5">
                        <div class="flex items-center gap-2">
                            <input v-model="form.paymentProof" type="text"
                                class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                            <button type="button"
                                @click="form.paymentProof = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c'"
                                class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl shrink-0">
                                Sample
                            </button>
                        </div>
                        <div v-if="form.paymentProof"
                            class="flex justify-between items-center px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px]">
                            <span class="text-slate-500 truncate max-w-[200px]">{{ form.paymentProof }}</span>
                            <button type="button" @click="form.paymentProof = ''"
                                class="text-red-500 font-bold hover:underline">Remove</button>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Transaction Date *</label>
                    <input v-model="form.transactionDate" type="date"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Description & Memo</label>
                    <textarea v-model="form.notes" rows="3"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/operationals"
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
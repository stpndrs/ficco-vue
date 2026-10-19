<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isSubmitting = ref(false)

const form = ref({
    code: 'EXP-105',
    title: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentProof: '',
    notes: ''
})

const handleSave = async () => {
    if (!form.value.title || !form.value.amount) {
        return alert('Judul pengeluaran dan jumlah (amount) wajib diisi!')
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            code: form.value.code,
            title: form.value.title,
            amount: Number(form.value.amount),
            transactionDate: form.value.transactionDate,
            paymentProof: form.value.paymentProof || null,
            notes: form.value.notes || null
        }

        const res = await axios.post('http://localhost:5000/api/operationals', payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/operationals')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal menyimpan pengeluaran operasional')
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
                        <h2 class="text-lg font-bold text-slate-900">Log Operating Expense</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">NEW
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
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Code (Auto-generated)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Amount ($) *</label>
                    <input v-model="form.amount" type="number" step="0.01" placeholder="0.00"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Expense Title *</label>
                    <input v-model="form.title" type="text" placeholder="e.g. Monthly Commercial Electricity & HVAC"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Payment Receipt / Proof URL
                        (Optional)</label>
                    <div class="flex items-center gap-2">
                        <input v-model="form.paymentProof" type="text"
                            placeholder="e.g. https://images.unsplash.com/..."
                            class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                        <button type="button"
                            @click="form.paymentProof = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c'"
                            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl shrink-0">
                            Sample
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Transaction Date *</label>
                    <input v-model="form.transactionDate" type="date"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Description & Memo</label>
                    <textarea v-model="form.notes" rows="3" placeholder="Vendor invoice number, billing period..."
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/operationals"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSave" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Expense Record
                </button>
            </div>
        </div>
    </div>
</template>
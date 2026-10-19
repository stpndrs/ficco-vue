<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const form = ref({
    id: '',
    code: 'TXN-1003',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Cash',
    status: 'Draft',
    notes: '',
    totalPrice: 11.00
})

const isSubmitting = ref(false)

const fetchOrder = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:5000/api/sales/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const data = res.data.data
            form.value = {
                id: data.id,
                code: data.code,
                customerName: data.customerName || '',
                customerPhone: data.customerPhone || '',
                paymentMethod: data.paymentMethod || 'Cash',
                status: data.status,
                notes: data.notes || '',
                totalPrice: Number(data.totalPrice)
            }
        }
    } catch (err) {
        alert('Gagal mengambil data pesanan')
    }
}

onMounted(fetchOrder)

const handleSaveChanges = async () => {
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const res = await axios.put(`http://localhost:5000/api/sales/${form.value.id}`, form.value, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            router.push('/sales/history')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui pesanan')
    } finally {
        isSubmitting.value = false
    }
}

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`
</script>

<template>
    <div class="space-y-6 text-left max-w-4xl mx-auto">
        <!-- Top Nav Tabs -->
        <div class="flex items-center gap-2">
            <router-link to="/sales"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50">
                + New Order (POS)
            </router-link>
            <router-link to="/sales/history"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50">
                Transaction History
            </router-link>
            <span
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                Editing Order: #{{ form.code }}
            </span>
        </div>

        <!-- Edit Order Form Card (Presisi Mockup Edit Order) -->
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h2 class="text-base font-bold text-slate-900">Edit Draft Order: #{{ form.code }}</h2>
                    <p class="text-xs text-slate-400">Update customer details, payment method, or finalize transaction
                        status.</p>
                </div>
                <router-link to="/sales/history"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back to List
                </router-link>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Transaction Code (ReadOnly)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select v-model="form.paymentMethod"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option value="Cash">Cash</option>
                        <option value="Card / POS">Card / POS</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Transaction Status</label>
                    <select v-model="form.status"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option value="Draft">Draft</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Order Notes / Memo</label>
                    <input v-model="form.notes" type="text" placeholder="Order pending confirmation"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                    <input v-model="form.customerName" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <!-- Total Box Right -->
                <div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex justify-between items-center">
                    <div>
                        <p class="text-xs font-semibold text-slate-500">Order Total Amount</p>
                        <p class="text-[10px] text-emerald-600 font-bold">Subtotal + Applied Taxes</p>
                    </div>
                    <span class="text-2xl font-extrabold text-indigo-600">{{ formatCurrency(form.totalPrice) }}</span>
                </div>

                <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Customer Phone (Optional)</label>
                    <input v-model="form.customerPhone" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/sales/history"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    Cancel
                </router-link>
                <button @click="handleSaveChanges" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Order Changes
                </button>
            </div>
        </div>
    </div>
</template>
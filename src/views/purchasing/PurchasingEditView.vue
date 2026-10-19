<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const form = ref({
	id: '',
	code: '',
	supplierName: '',
	itemName: '',
	status: 'Approved',
	notes: '',
	totalAmount: 0
})

const fetchPO = async () => {
	try {
		const token = localStorage.getItem('token')
		const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/${route.params.id}`, {
			headers: { Authorization: `Bearer ${token}` }
		})
		if (res.data.status) {
			const p = res.data.data
			form.value = {
				id: p.id,
				code: p.code || `PO-2026-${p.id.substring(0, 3)}`,
				supplierName: p.supplier?.name || p.supplierName || 'Pacific Coffee Importers LLC',
				itemName: p.material?.name || p.itemName || 'Ethiopian Yirgacheffe Green Beans',
				status: p.status || 'Paid',
				notes: p.notes || '',
				totalAmount: Number(p.totalPrice || p.totalAmount || 0)
			}
		}
	} catch (err) {
		alert('Gagal mengambil data Purchase Order')
	}
}

onMounted(fetchPO)

const handleSaveChanges = async () => {
	isSubmitting.value = true
	try {
		const token = localStorage.getItem('token')
		const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/${form.value.id}`, {
			status: form.value.status,
			notes: form.value.notes
		}, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			router.push('/purchasing')
		}
	} catch (err) {
		alert(err.response?.data?.message || 'Gagal memperbarui Purchase Order')
	} finally {
		isSubmitting.value = false
	}
}

const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`
</script>

<template>
	<div class="max-w-2xl mx-auto text-left">
		<div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
			<div class="flex justify-between items-center pb-4 border-b border-slate-100">
				<div>
					<h2 class="text-lg font-bold text-slate-900">Edit Purchase Order: #{{ form.code }}</h2>
					<p class="text-xs text-slate-400 mt-0.5">Update status or procurement notes.</p>
				</div>
				<router-link to="/purchasing"
					class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
					← Back
				</router-link>
			</div>

			<div class="space-y-4">
				<div>
					<label class="block text-xs font-semibold text-slate-600 mb-1">Supplier Vendor</label>
					<input type="text" :value="form.supplierName" disabled
						class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
				</div>

				<div>
					<label class="block text-xs font-semibold text-slate-600 mb-1">Procured Item</label>
					<input type="text" :value="form.itemName" disabled
						class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
				</div>

				<div>
					<label class="block text-xs font-semibold text-slate-600 mb-1">Order Status</label>
					<select v-model="form.status"
						class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
						<option value="Paid">Paid</option>
						<option value="Approved">Approved</option>
						<option value="Pending">Pending</option>
					</select>
				</div>

				<div>
					<label class="block text-xs font-semibold text-slate-600 mb-1">Order Notes</label>
					<textarea v-model="form.notes" rows="3"
						class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
				</div>

				<div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
					<span class="text-xs font-semibold text-slate-600">Total PO Expenditure:</span>
					<span class="text-xl font-extrabold text-indigo-600">{{ formatCurrency(form.totalAmount) }}</span>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
				<router-link to="/purchasing"
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
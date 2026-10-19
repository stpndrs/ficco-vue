<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const suppliers = ref([])
const materials = ref([])
const isSubmitting = ref(false)

const form = ref({
	code: 'PO-2026-004',
	orderDate: new Date().toISOString().split('T')[0],
	supplierId: '',
	category: 'Raw Material',
	notes: '',
	materialId: '',
	materialCode: 'MAT-101',
	quantity: 10,
	unitPrice: 18.50,
	taxRate: 9,
	paymentProof: ''
})

const fetchDropdowns = async () => {
	try {
		const token = localStorage.getItem('token')
		const [supRes, matRes] = await Promise.all([
			axios.get('http://localhost:5000/api/purchasing/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
			axios.get('http://localhost:5000/api/materials', { headers: { Authorization: `Bearer ${token}` } })
		])

		if (supRes.data.status) {
			suppliers.value = supRes.data.data
			if (suppliers.value.length) form.value.supplierId = suppliers.value[0].id
		}
		if (matRes.data.status) {
			materials.value = matRes.data.data
			if (materials.value.length) {
				form.value.materialId = materials.value[0].id
				form.value.materialCode = materials.value[0].code || 'MAT-101'
			}
		}
	} catch (err) {
		console.error('Failed to load dropdowns:', err)
	}
}

onMounted(fetchDropdowns)

const onMaterialChange = () => {
	const selected = materials.value.find((m) => m.id === form.value.materialId)
	if (selected) {
		form.value.materialCode = selected.code || `MAT-${selected.id.substring(0, 3)}`
		if (selected.price) form.value.unitPrice = Number(selected.price)
	}
}

// Calculations
const subtotal = computed(() => Number(form.value.quantity || 0) * Number(form.value.unitPrice || 0))
const calculatedTax = computed(() => (subtotal.value * Number(form.value.taxRate || 0)) / 100)
const totalExpenditure = computed(() => subtotal.value + calculatedTax.value)

const handleSave = async () => {
	if (!form.value.supplierId || !form.value.materialId) {
		return alert('Supplier dan Material wajib dipilih!')
	}

	isSubmitting.value = true
	try {
		const token = localStorage.getItem('token')
		const payload = {
			code: form.value.code,
			orderDate: form.value.orderDate,
			supplierId: form.value.supplierId,
			materialId: form.value.materialId,
			category: form.value.category,
			qty: Number(form.value.quantity),
			unitPrice: Number(form.value.unitPrice),
			tax: calculatedTax.value,
			subtotal: subtotal.value,
			totalPrice: totalExpenditure.value,
			notes: form.value.notes,
			paymentProof: form.value.paymentProof
		}

		const res = await axios.post('http://localhost:5000/api/purchasing', payload, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			router.push('/purchasing')
		}
	} catch (err) {
		alert(err.response?.data?.message || 'Gagal menyimpan Purchase Order')
	} finally {
		isSubmitting.value = false
	}
}

const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`
</script>

<template>
	<div class="max-w-3xl mx-auto text-left">
		<div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
			<div class="flex justify-between items-center pb-4 border-b border-slate-100">
				<div>
					<h2 class="text-lg font-bold text-slate-900">Create Purchase Order</h2>
					<p class="text-xs text-slate-400 mt-0.5">Record procurement expenses, taxes, and vendor payment
						documentation.</p>
				</div>
				<router-link to="/purchasing"
					class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
					← Back
				</router-link>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<!-- Left Section -->
				<div class="space-y-4">
					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">PO Code (Auto-generated)</label>
						<input type="text" :value="form.code" disabled
							class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold" />
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Order Date *</label>
						<input v-model="form.orderDate" type="date"
							class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Select Supplier *</label>
						<select v-model="form.supplierId"
							class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
							<option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Item Category / Type *</label>
						<select v-model="form.category"
							class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
							<option value="Raw Material">Raw Material</option>
							<option value="Packaging">Packaging</option>
							<option value="Equipment">Equipment</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Order Notes</label>
						<textarea v-model="form.notes" rows="3"
							placeholder="Logistics tracking, batch numbers, or terms..."
							class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
					</div>
				</div>

				<!-- Right Section -->
				<div class="space-y-4">
					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Material Name Select *</label>
						<select v-model="form.materialId" @change="onMaterialChange"
							class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
							<option v-for="mat in materials" :key="mat.id" :value="mat.id">{{ mat.name }}</option>
						</select>
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-600 mb-1">Material Code
							(Autofilled)</label>
						<input type="text" :value="form.materialCode" disabled
							class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" />
					</div>

					<div class="grid grid-cols-3 gap-2">
						<div>
							<label class="block text-[10px] font-semibold text-slate-600 mb-1">Quantity *</label>
							<input v-model="form.quantity" type="number"
								class="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
						</div>
						<div>
							<label class="block text-[10px] font-semibold text-slate-600 mb-1">Unit Price ($) *</label>
							<input v-model="form.unitPrice" type="number" step="0.01"
								class="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
						</div>
						<div>
							<label class="block text-[10px] font-semibold text-slate-600 mb-1">Tax Rate (%)</label>
							<input v-model="form.taxRate" type="number"
								class="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
						</div>
					</div>

					<!-- Total Expenditure Summary Box -->
					<div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
						<div class="flex justify-between text-slate-500"><span>Subtotal Before Tax</span><span>{{
							formatCurrency(subtotal) }}</span></div>
						<div class="flex justify-between text-slate-500"><span>Calculated Tax ({{ form.taxRate
						}}%)</span><span>{{ formatCurrency(calculatedTax) }}</span></div>
						<div
							class="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
							<span>Total Expenditure</span><span class="text-indigo-600">{{
								formatCurrency(totalExpenditure) }}</span>
						</div>
					</div>
				</div>

				<div class="md:col-span-2">
					<label class="block text-xs font-semibold text-slate-600 mb-1">Payment Proof / Receipt
						Document</label>
					<input v-model="form.paymentProof" type="text"
						placeholder="e.g. https://images.unsplash.com/... or receipt URL"
						class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
				<router-link to="/purchasing"
					class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
					Cancel
				</router-link>
				<button @click="handleSave" :disabled="isSubmitting"
					class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
					✓ Save Purchase Order
				</button>
			</div>
		</div>
	</div>
</template>
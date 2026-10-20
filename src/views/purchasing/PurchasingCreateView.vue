<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

const router = useRouter()

const suppliers = ref([])
const materials = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationMessage = ref({})

const formHeader = ref({
	supplierId: '',
	code: '',
	date: '',
	paymentProof: ''
})

const items = ref([])

const addItem = () => {
	items.value.push({
		materialId: '',
		materialCode: '',
		qty: '',
		unitPrice: '',
		tax: '',
		notes: ''
	})
}

const removeItem = (index) => {
	if (items.value.length > 1) {
		items.value.splice(index, 1)
	}
}

const fetchDropdowns = async () => {
	try {
		const token = localStorage.getItem('token')
		const [purCode, supRes, matRes] = await Promise.all([
			axios.get(`${import.meta.env.VITE_APP_API_URL}/api/code/generate`, { headers: { Authorization: `Bearer ${token}` }, params: { type: "purchasing" } }),
			axios.get(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
			axios.get(`${import.meta.env.VITE_APP_API_URL}/api/materials`, { headers: { Authorization: `Bearer ${token}` } }),
		])

		formHeader.value.code = purCode.data.data
		suppliers.value = supRes.data.data || []
		materials.value = matRes.data.data || []
	} catch (err) {
		console.error('Failed to load dropdowns:', err)
	}
}

onMounted(() => {
	fetchDropdowns()
	addItem()
})

const onMaterialChange = (index) => {
	const item = items.value[index]
	const selected = materials.value.find((m) => m.id === item.materialId)

	if (selected) {
		item.materialCode = selected.code || ''

		if (selected.price) {
			item.unitPrice = Number(selected.price)
		}
	} else {
		item.materialCode = ''
		item.unitPrice = ''
	}
}

const calculateSubtotal = (item) => Number(item.qty || 0) * Number(item.unitPrice || 0)
const grandTotal = computed(() => {
	return items.value.reduce((sum, item) => {
		return sum + calculateSubtotal(item) + Number(item.tax || 0)
	}, 0)
})

const handleSave = async () => {
	errorMessage.value = ''
	validationMessage.value = {}

	isSubmitting.value = true
	try {
		const token = localStorage.getItem('token')

		const payload = {
			supplierId: formHeader.value.supplierId || null,
			code: formHeader.value.code,
			date: formHeader.value.date,
			paymentProof: formHeader.value.paymentProof || null,
			items: items.value.map(item => ({
				materialId: item.materialId,
				qty: Number(item.qty),
				unitPrice: Number(item.unitPrice),
				tax: Number(item.tax || 0),
				notes: item.notes || null
			}))
		}

		const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/purchasing`, payload, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			router.push('/purchasing')
		}
	} catch (err) {
		errorMessage.value = err.response?.data?.message || 'Gagal menyimpan Purchase Order'
		validationMessage.value = err.response?.data?.errors || {}
	} finally {
		isSubmitting.value = false
	}
}

// Penyesuaian Helper Penangkapan Error Response Zod / API
const getFieldError = (field) => {
	const errs = validationMessage.value
	if (!errs || !errs[field]) return null
	return Array.isArray(errs[field]) ? errs[field][0] : errs[field]
}

// Menangani pencarian error per-item atau pesan umum items
const getItemError = (keyword) => {
	const errs = validationMessage.value?.items
	if (!errs || !Array.isArray(errs)) return null
	return errs.find(msg => typeof msg === 'string' && msg.toLowerCase().includes(keyword)) || null
}
</script>

<template>
	<div class="max-w-4xl mx-auto text-left px-4 sm:px-6 py-4">
		<div class="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
			<!-- Header -->
			<div
				class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
				<div>
					<h2 class="text-base sm:text-lg font-bold text-slate-900">Create Purchase Order</h2>
					<p class="text-xs text-slate-400 mt-0.5">Record multi-item procurement expenses, taxes, and vendor
						payment.</p>
				</div>
				<router-link to="/purchasing"
					class="w-full sm:w-auto text-center px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
					← Back
				</router-link>
			</div>

			<div v-if="errorMessage"
				class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
				{{ errorMessage }}
			</div>

			<!-- Main Transaction Details -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
				<BaseInput v-model="formHeader.code" type="text" label="Order Code" :error="getFieldError('code')"
					required disabled />

				<BaseInput v-model="formHeader.date" type="date" label="Order Date" :error="getFieldError('date')"
					required />

				<BaseSelect v-model="formHeader.supplierId" label="Select Supplier" :options="suppliers" valueKey="id"
					labelKey="name" placeholder="-- Pilih Supplier --" :error="getFieldError('supplierId')" />

				<BaseInput v-model="formHeader.paymentProof" label="Payment Proof / Receipt URL"
					placeholder="e.g. https://link-to-receipt.com/pdf" :error="getFieldError('paymentProof')" />
			</div>

			<!-- Multi Items Section -->
			<div class="space-y-4">
				<div class="flex justify-between items-center pt-2">
					<h3 class="text-sm font-bold text-slate-800">Purchasing Items</h3>
					<button @click="addItem" type="button"
						class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
						+ Add Item
					</button>
				</div>

				<div v-for="(item, index) in items" :key="index"
					class="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 relative">
					<div class="flex justify-between items-center border-b border-slate-100 pb-2">
						<span class="text-xs font-bold text-slate-500">Item #{{ index + 1 }}</span>
						<button v-if="items.length > 1" @click="removeItem(index)" type="button"
							class="text-xs font-semibold text-red-500 hover:text-red-700">
							Remove
						</button>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
						<div class="md:col-span-2">
							<!-- Dropdown Material -->
							<BaseSelect v-model="item.materialId" label="Material" :options="materials" valueKey="id"
								labelKey="name" placeholder="-- Pilih Material --" :error="getItemError('material')"
								required @update:modelValue="onMaterialChange(index)" />
						</div>

						<!-- Field Kode Material (Otomatis terisi dari item.materialCode) -->
						<BaseInput label="Code" :modelValue="item.materialCode" placeholder="Auto" disabled />

						<BaseInput v-model.number="item.qty" type="number" label="Quantity" placeholder="0"
							:error="getItemError('jumlah')" required />
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<BaseInput v-model.number="item.unitPrice" type="number" label="Unit Price ($)"
							placeholder="0.00" :error="getItemError('harga')" required />
						<BaseInput v-model.number="item.tax" type="number" label="Tax ($)" placeholder="0.00"
							:error="getItemError('tax')" />
						<div class="flex flex-col gap-1.5 w-full">
							<label class="text-xs font-semibold text-slate-600">Subtotal</label>
							<div
								class="px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 rounded-xl border border-slate-200">
								{{ formatCurrency(calculateSubtotal(item) + Number(item.tax || 0)) }}
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-1.5 w-full">
						<label class="text-xs font-semibold text-slate-600">Item Notes (Optional)</label>
						<input v-model="item.notes" type="text" placeholder="Notes for this item..."
							class="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition" />
					</div>
				</div>
			</div>

			<!-- Grand Total Box -->
			<div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
				<span class="text-xs font-bold text-slate-600">Grand Total Expenditure:</span>
				<span class="text-xl font-extrabold text-indigo-600">{{ formatCurrency(grandTotal) }}</span>
			</div>

			<div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
				<router-link to="/purchasing"
					class="w-full sm:w-auto text-center px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
					Cancel
				</router-link>
				<div class="w-full sm:w-auto">
					<BaseButton :loading="isSubmitting" @click="handleSave" class="!py-2.5 !text-xs">
						✓ Save Purchase Order
					</BaseButton>
				</div>
			</div>
		</div>
	</div>
</template>
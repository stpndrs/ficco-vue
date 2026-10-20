<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

const router = useRouter()

// --- STATE DATA ---
const purchaseOrders = ref([])
const suppliers = ref([])
const isLoading = ref(false)

// --- FILTERS ---
const search = ref('')
const dateFilter = ref('All Dates')

const dateOptions = [
	{ id: 'All Dates', name: 'All Dates' },
	{ id: 'This Month', name: 'This Month' }
]

// --- SUPPLIER DRAWER STATE ---
const showSupplierDrawer = ref(false)
const supplierForm = ref({ id: '', name: '', phone: '', address: '' })
const isEditSupplier = ref(false)
const supplierErrors = ref({})
const isSavingSupplier = ref(false)

// --- DETAIL MODAL STATE ---
const selectedPO = ref(null)
const showDetailModal = ref(false)
const isFetchingDetail = ref(false)

// --- TOAST STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
	toast.value = { show: true, message, type }
	setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCHERS ---
const fetchSuppliers = async () => {
	try {
		const token = localStorage.getItem('token')
		const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/suppliers`, {
			headers: { Authorization: `Bearer ${token}` }
		})
		if (res.data.status) suppliers.value = res.data.data
	} catch (err) {
		console.error('Failed to load suppliers:', err)
	}
}

const fetchpurchasing = async () => {
	isLoading.value = true
	try {
		const token = localStorage.getItem('token')
		let url = `${import.meta.env.VITE_APP_API_URL}/api/purchasing?limit=50`
		if (search.value) url += `&search=${search.value}`

		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			purchaseOrders.value = res.data.data || []
		}
	} catch (err) {
		showToast(err.response?.data?.message || 'Gagal memuat daftar pembelian', 'error')
	} finally {
		isLoading.value = false
	}
}

onMounted(() => {
	fetchSuppliers()
	fetchpurchasing()
})

// --- SUPPLIER ACTIONS ---
const handleSaveSupplier = async () => {
	supplierErrors.value = {}
	if (!supplierForm.value.name) {
		supplierErrors.value.name = 'Nama supplier wajib diisi!'
		return
	}

	isSavingSupplier.value = true
	try {
		const token = localStorage.getItem('token')
		let res
		if (isEditSupplier.value) {
			res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/suppliers/${supplierForm.value.id}`, supplierForm.value, {
				headers: { Authorization: `Bearer ${token}` }
			})
		} else {
			res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/suppliers`, supplierForm.value, {
				headers: { Authorization: `Bearer ${token}` }
			})
		}

		if (res.data.status) {
			showToast(isEditSupplier.value ? 'Supplier diperbarui!' : 'Supplier baru disimpan!')
			supplierForm.value = { id: '', name: '', phone: '', address: '' }
			isEditSupplier.value = false
			fetchSuppliers()
		}
	} catch (err) {
		const errData = err.response?.data
		if (errData?.errors && typeof errData.errors === 'object') {
			supplierErrors.value = errData.errors
		} else {
			showToast(errData?.message || 'Gagal menyimpan supplier', 'error')
		}
	} finally {
		isSavingSupplier.value = false
	}
}

const deleteSupplier = async (id) => {
	if (!confirm('Hapus supplier ini?')) return
	try {
		const token = localStorage.getItem('token')
		const res = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/suppliers/${id}`, {
			headers: { Authorization: `Bearer ${token}` }
		})
		if (res.data.status) {
			showToast('Supplier berhasil dihapus')
			fetchSuppliers()
		}
	} catch (err) {
		showToast('Gagal menghapus supplier', 'error')
	}
}

// --- PO DETAIL ACTION (Fetch ke Endpoint Show) ---
const openDetails = async (po) => {
	showDetailModal.value = true
	isFetchingDetail.value = true
	selectedPO.value = null

	try {
		const token = localStorage.getItem('token')
		// Fetching ke endpoint show /api/purchasing/:id
		const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/purchasing/${po.id}`, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			selectedPO.value = res.data.data
		}
	} catch (err) {
		showToast(err.response?.data?.message || 'Gagal mengambil detail pembelian', 'error')
		showDetailModal.value = false
	} finally {
		isFetchingDetail.value = false
	}
}

// Helper kalkulasi total dari purchasingDetails
const calculateTotalExpenditure = (details) => {
	if (!Array.isArray(details)) return 0
	return details.reduce((sum, item) => sum + Number(item.subtotal || 0) + Number(item.tax || 0), 0)
}

const formatDate = (dateString) => {
	if (!dateString) return '-'
	return new Date(dateString).toISOString().split('T')[0]
}
</script>

<template>
	<div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
		<!-- Toast Alert -->
		<div v-if="toast.show" :class="[
			'fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
			toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
		]">
			<span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
			<span>{{ toast.message }}</span>
		</div>

		<!-- Filter Bar -->
		<div
			class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
			<div class="w-full lg:w-96">
				<BaseInput v-model="search" placeholder="Search PO code..." @input="fetchpurchasing" />
			</div>

			<div
				class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end">
				<div class="w-full sm:w-36">
					<BaseSelect v-model="dateFilter" :options="dateOptions" valueKey="id" labelKey="name" />
				</div>

				<button @click="showSupplierDrawer = true"
					class="w-full sm:w-auto px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0">
					<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					Manage Suppliers
				</button>

				<router-link to="/purchasing/create"
					class="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 shrink-0">
					<span>+</span> Create Purchase Order
				</router-link>
			</div>
		</div>

		<!-- Data Table -->
		<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[600px]">
				<thead>
					<tr
						class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						<th class="py-3.5 px-4 whitespace-nowrap">PO CODE</th>
						<th class="py-3.5 px-4 whitespace-nowrap">ORDER DATE</th>
						<th class="py-3.5 px-4 whitespace-nowrap">CREATED AT</th>
						<th class="py-3.5 px-4 whitespace-nowrap">PAYMENT PROOF</th>
						<th class="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					<tr v-if="isLoading">
						<td colspan="5" class="py-8 text-center text-slate-400">Loading purchase orders...</td>
					</tr>
					<tr v-else-if="purchaseOrders.length === 0">
						<td colspan="5" class="py-8 text-center text-slate-400">Belum ada transaksi pembelian.</td>
					</tr>
					<tr v-for="po in purchaseOrders" :key="po.id" class="hover:bg-slate-50/50 transition">
						<td class="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">
							{{ po.code }}
						</td>
						<td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
							{{ formatDate(po.date) }}
						</td>
						<td class="py-3.5 px-4 text-slate-500 whitespace-nowrap">
							{{ formatDate(po.createdAt) }}
						</td>
						<td class="py-3.5 px-4 whitespace-nowrap">
							<a v-if="po.paymentProof" :href="po.paymentProof" target="_blank"
								class="text-indigo-600 font-semibold underline">
								View Receipt
							</a>
							<span v-else class="text-slate-400 italic">No proof</span>
						</td>
						<td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
							<button @click="openDetails(po)"
								class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
								👁 Details
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- MODAL POPUP: PURCHASE ORDER DETAILS (Data Fetched via Show API) -->
		<div v-if="showDetailModal"
			class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
			<div
				class="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 text-left relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
				<button @click="showDetailModal = false"
					class="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>

				<div v-if="isFetchingDetail" class="py-12 text-center text-slate-400">
					Loading purchase order details...
				</div>

				<div v-else-if="selectedPO" class="space-y-5">
					<div>
						<h3 class="text-base font-bold text-slate-900 pr-6">
							Purchase Order #{{ selectedPO.code }}
						</h3>
						<p class="text-xs text-slate-400 mt-0.5">
							Order Date: {{ formatDate(selectedPO.date) }}
						</p>
					</div>

					<!-- Supplier Info Box -->
					<div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUPPLIER INFORMATION
						</p>
						<div v-if="selectedPO.supplier">
							<p class="text-sm font-bold text-slate-800">{{ selectedPO.supplier.name }}</p>
							<p class="text-xs text-slate-500">{{ selectedPO.supplier.phone || 'No phone' }} · {{
								selectedPO.supplier.address || 'No address' }}</p>
						</div>
						<p v-else class="text-xs text-slate-400 italic">No supplier specified</p>
					</div>

					<!-- Purchasing Items Table -->
					<div class="space-y-2">
						<p class="text-xs font-bold text-slate-800">Purchased Items ({{
							selectedPO.purchasingDetails?.length || 0 }})</p>
						<div class="border border-slate-200/80 rounded-2xl overflow-hidden">
							<table class="w-full text-left text-xs border-collapse">
								<thead
									class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
									<tr>
										<th class="py-2.5 px-3">MATERIAL</th>
										<th class="py-2.5 px-3">QTY</th>
										<th class="py-2.5 px-3">UNIT PRICE</th>
										<th class="py-2.5 px-3">TAX</th>
										<th class="py-2.5 px-3 text-right">SUBTOTAL</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									<tr v-for="item in selectedPO.purchasingDetails" :key="item.id"
										class="hover:bg-slate-50/50">
										<td class="py-2.5 px-3">
											<p class="font-bold text-slate-800">{{ item.material?.name || 'Unknown												Material' }}</p>
											<p class="text-[10px] text-slate-400">{{ item.material?.code }} · {{
												item.notes || 'No notes' }}</p>
										</td>
										<td class="py-2.5 px-3 font-semibold text-slate-700">{{ item.qty }}</td>
										<td class="py-2.5 px-3 text-slate-600">{{ formatCurrency(item.unitPrice) }}</td>
										<td class="py-2.5 px-3 text-slate-600">{{ formatCurrency(item.tax) }}</td>
										<td class="py-2.5 px-3 text-right font-bold text-slate-900">
											{{ formatCurrency(Number(item.subtotal || 0) + Number(item.tax || 0)) }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Total Expenditure Summary -->
					<div
						class="p-4 bg-indigo-50/60 rounded-2xl flex justify-between items-center border border-indigo-100">
						<span class="text-xs font-bold text-slate-600">Total Expenditure:</span>
						<span class="text-lg font-extrabold text-indigo-600">
							{{ formatCurrency(calculateTotalExpenditure(selectedPO.purchasingDetails)) }}
						</span>
					</div>

					<div v-if="selectedPO.paymentProof" class="text-xs">
						<span class="text-slate-500 font-medium">Payment Proof: </span>
						<a :href="selectedPO.paymentProof" target="_blank" class="text-indigo-600 font-bold underline">
							View Document
						</a>
					</div>

					<BaseButton @click="showDetailModal = false" class="!py-2.5 !text-xs">
						← Close
					</BaseButton>
				</div>
			</div>
		</div>

		<!-- OFFCANVAS DRAWER: SUPPLIER MANAGEMENT -->
		<div v-if="showSupplierDrawer" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
			<div
				class="bg-white w-full max-w-md h-full p-5 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto text-left relative">
				<div>
					<div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
						<div>
							<h2 class="text-base font-bold text-slate-900">Supplier</h2>
							<p class="text-xs text-slate-400 mt-0.5">Register and manage trusted wholesale vendors,
								dairy producers, and packaging suppliers.</p>
						</div>
						<button @click="showSupplierDrawer = false"
							class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
					</div>

					<!-- Register Supplier Card -->
					<div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3">
						<p class="text-xs font-bold text-slate-800">{{ isEditSupplier ? 'Edit Supplier' : 'Register New							Supplier' }}</p>

						<BaseInput v-model="supplierForm.name" label="Supplier Corporate Name"
							placeholder="e.g. PT Supplier Utama" :error="supplierErrors.name" required />

						<BaseInput v-model="supplierForm.phone" label="Direct Phone / WhatsApp"
							placeholder="e.g. 081234567890" :error="supplierErrors.phone" />

						<div class="flex flex-col gap-1.5 w-full">
							<label class="text-xs font-semibold text-slate-600">Facility or Warehouse Address
								(Optional)</label>
							<textarea v-model="supplierForm.address" rows="2" placeholder="e.g. Surabaya, Indonesia"
								class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-indigo-600 transition duration-200"
								:class="{ 'border-red-500 focus:ring-2 focus:ring-red-200': supplierErrors.address }"></textarea>
							<span v-if="supplierErrors.address" class="text-xs text-red-500 font-medium">{{
								supplierErrors.address }}</span>
						</div>

						<BaseButton :loading="isSavingSupplier" @click="handleSaveSupplier" class="!py-2 !text-xs">
							+ Save Supplier
						</BaseButton>
					</div>

					<!-- Registered Vendors List -->
					<p class="text-xs font-bold text-slate-800 mb-3">Registered Vendors ({{ suppliers.length }})</p>
					<div class="space-y-2">
						<div v-for="sup in suppliers" :key="sup.id"
							class="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex justify-between items-center gap-2">
							<div class="min-w-0 flex-1">
								<p class="text-xs font-bold text-slate-800 truncate">{{ sup.name }}</p>
								<p class="text-[10px] text-slate-500">{{ sup.phone || 'No phone' }}</p>
								<p class="text-[10px] text-slate-400 line-clamp-1">{{ sup.address || 'No address' }}</p>
							</div>

							<div class="flex items-center gap-2 text-xs shrink-0">
								<button @click="isEditSupplier = true; supplierForm = { ...sup }; supplierErrors = {}"
									class="text-indigo-600 font-semibold p-1">Edit</button>
								<button @click="deleteSupplier(sup.id)"
									class="text-red-500 font-semibold p-1">Delete</button>
							</div>
						</div>
					</div>
				</div>

				<button @click="showSupplierDrawer = false"
					class="w-full py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-50 mt-6">
					Close Drawer
				</button>
			</div>
		</div>
	</div>
</template>
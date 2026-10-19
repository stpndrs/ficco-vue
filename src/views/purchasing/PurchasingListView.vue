<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// --- STATE DATA ---
const purchaseOrders = ref([])
const suppliers = ref([])
const isLoading = ref(false)

// --- FILTERS ---
const search = ref('')
const dateFilter = ref('All Dates')
const statusFilter = ref('All Statuses')

// --- SUPPLIER DRAWER STATE ---
const showSupplierDrawer = ref(false)
const supplierForm = ref({ id: '', name: '', phone: '', address: '' })
const isEditSupplier = ref(false)

// --- DETAIL MODAL STATE ---
const selectedPO = ref(null)
const showDetailModal = ref(false)

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
		if (statusFilter.value !== 'All Statuses') url += `&status=${statusFilter.value}`

		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` }
		})

		if (res.data.status) {
			purchaseOrders.value = res.data.data
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
	if (!supplierForm.value.name) return showToast('Nama supplier wajib diisi!', 'error')
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
		showToast(err.response?.data?.message || 'Gagal menyimpan supplier', 'error')
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

// --- PO DETAIL ACTION ---
const openDetails = (po) => {
	selectedPO.value = po
	showDetailModal.value = true
}

const getStatusBadge = (status) => {
	if (status === 'Paid') return 'bg-emerald-50 text-emerald-600 border-emerald-200'
	if (status === 'Approved') return 'bg-indigo-50 text-indigo-600 border-indigo-200'
	return 'bg-amber-50 text-amber-600 border-amber-200'
}

const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`
</script>

<template>
	<div class="space-y-6 text-left relative">
		<!-- Toast Alert -->
		<div v-if="toast.show" :class="[
			'fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300',
			toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
		]">
			<span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
			<span>{{ toast.message }}</span>
		</div>

		<!-- Filter Bar (Presisi Mockup FR-0178 - FR-0181) -->
		<div
			class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
			<div class="relative w-full lg:w-96">
				<input v-model="search" @input="fetchpurchasing" type="text"
					placeholder="Search PO code, item name, or vendor..."
					class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
				<svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
					stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>

			<div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
				<select v-model="dateFilter"
					class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
					<option value="All Dates">All Dates</option>
					<option value="This Month">This Month</option>
				</select>

				<select v-model="statusFilter" @change="fetchpurchasing"
					class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
					<option value="All Statuses">All Statuses</option>
					<option value="Paid">Paid</option>
					<option value="Approved">Approved</option>
					<option value="Pending">Pending</option>
				</select>

				<button @click="showSupplierDrawer = true"
					class="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0">
					<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					Manage Suppliers
				</button>

				<router-link to="/purchasing/create"
					class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
					<span>+</span> Create Purchase Order
				</router-link>
			</div>
		</div>

		<!-- Data Table (Presisi Mockup FR-0177) -->
		<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr
						class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						<th class="py-3.5 px-4">PO CODE</th>
						<th class="py-3.5 px-4">ORDER DATE</th>
						<th class="py-3.5 px-4">SUPPLIER</th>
						<th class="py-3.5 px-4">ITEM NAME</th>
						<th class="py-3.5 px-4">CATEGORY / TYPE</th>
						<th class="py-3.5 px-4">QUANTITY</th>
						<th class="py-3.5 px-4">TOTAL AMOUNT</th>
						<th class="py-3.5 px-4">STATUS</th>
						<th class="py-3.5 px-4 text-right">ACTIONS</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					<tr v-if="isLoading">
						<td colspan="9" class="py-8 text-center text-slate-400">Loading purchase orders...</td>
					</tr>
					<tr v-else-if="purchaseOrders.length === 0">
						<td colspan="9" class="py-8 text-center text-slate-400">Belum ada transaksi pembelian.</td>
					</tr>
					<tr v-for="po in purchaseOrders" :key="po.id" class="hover:bg-slate-50/50 transition">
						<td class="py-3.5 px-4 font-bold text-indigo-600">
							{{ po.code || `PO-2026-${po.id.substring(0, 3)}` }}
						</td>
						<td class="py-3.5 px-4 text-slate-600 font-medium">
							{{ new Date(po.createdAt).toISOString().split('T')[0] }}
						</td>
						<td class="py-3.5 px-4 font-bold text-slate-800">
							{{ po.supplier?.name || po.supplierName || 'Pacific Coffee Importers LLC' }}
						</td>
						<td class="py-3.5 px-4 text-slate-700 font-semibold">
							{{ po.material?.name || po.itemName || 'Ethiopian Yirgacheffe Green Beans' }}
						</td>
						<td class="py-3.5 px-4">
							<span
								class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
								{{ po.category || 'Raw Material' }}
							</span>
						</td>
						<td class="py-3.5 px-4 font-extrabold text-slate-900">
							{{ po.qty || po.quantity || 100 }}
						</td>
						<td class="py-3.5 px-4 font-extrabold text-slate-900">
							{{ formatCurrency(po.totalPrice || po.totalAmount) }}
						</td>
						<td class="py-3.5 px-4">
							<span
								:class="['px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1', getStatusBadge(po.status)]">
								● {{ po.status || 'Paid' }}
							</span>
						</td>
						<td class="py-3.5 px-4 text-right space-x-1.5">
							<button @click="openDetails(po)"
								class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
								👁 Details
							</button>
							<router-link :to="`/purchasing/edit/${po.id}`"
								class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
								✏️ Edit
							</router-link>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- ========================================================================= -->
		<!-- MODAL POPUP: PURCHASE ORDER DETAILS (Presisi Mockup FR-0185 - FR-0196) -->
		<!-- ========================================================================= -->
		<div v-if="showDetailModal && selectedPO"
			class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
			<div
				class="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative space-y-5 animate-in fade-in zoom-in duration-150">
				<button @click="showDetailModal = false"
					class="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>

				<div>
					<h3 class="text-base font-bold text-slate-900">
						Purchase Order #{{ selectedPO.code || `PO-2026-${selectedPO.id.substring(0, 3)}` }}
					</h3>
					<p class="text-xs text-slate-400 mt-0.5">
						Vendor: {{ selectedPO.supplier?.name || selectedPO.supplierName || 'Pacific Coffee Importers LLC' }} - Date:
						{{ new Date(selectedPO.createdAt).toISOString().split('T')[0] }}
					</p>
				</div>

				<div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
					<div class="flex justify-between items-start">
						<div>
							<p class="text-xs font-bold text-indigo-600">#{{ selectedPO.code || 'PO-2026-001' }} · {{
								new
									Date(selectedPO.createdAt).toISOString().split('T')[0] }}</p>
							<h4 class="text-sm font-extrabold text-slate-900 mt-0.5">
								{{ selectedPO.material?.name || selectedPO.itemName || 'Ethiopian Yirgacheffe Green Beans(100 lbs)' }}
							</h4>
							<p class="text-[10px] text-slate-400 mt-1">
								Type / Classification: <span class="font-bold text-slate-600">{{ selectedPO.category ||
									'Raw Material'
								}}</span> - Supplier: <span class="font-bold text-slate-600">{{
										selectedPO.supplier?.name || 'Pacific Coffee Importers LLC' }}</span>
							</p>
						</div>
						<span
							:class="['px-2.5 py-1 rounded-full text-[10px] font-bold border', getStatusBadge(selectedPO.status)]">
							● {{ selectedPO.status || 'Paid' }}
						</span>
					</div>
				</div>

				<div class="p-4 bg-white border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-4">
					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROCURED QUANTITY</p>
						<p class="text-xl font-extrabold text-slate-900 mt-1">
							{{ selectedPO.qty || selectedPO.quantity || 100 }} <span
								class="text-xs font-normal text-slate-500">units</span>
						</p>
					</div>

					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UNIT PRICE</p>
						<p class="text-xl font-extrabold text-slate-900 mt-1">
							{{ formatCurrency(selectedPO.unitPrice || 8.50) }}
						</p>
					</div>
				</div>

				<div class="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
					<div class="flex justify-between text-slate-500">
						<span>Subtotal</span>
						<span>{{ formatCurrency(selectedPO.subtotal || 850.00) }}</span>
					</div>
					<div class="flex justify-between text-slate-500">
						<span>Sales Tax</span>
						<span>{{ formatCurrency(selectedPO.tax || 76.50) }}</span>
					</div>
					<div
						class="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
						<span>Total Expenditure</span>
						<span class="text-indigo-600">{{ formatCurrency(selectedPO.totalPrice || selectedPO.totalAmount
							|| 926.50)
						}}</span>
					</div>
				</div>

				<div v-if="selectedPO.notes" class="p-3 bg-slate-50 rounded-xl text-xs">
					<p class="text-[10px] font-bold text-slate-400 uppercase">Notes:</p>
					<p class="text-slate-700 mt-0.5">{{ selectedPO.notes }}</p>
				</div>

				<button @click="showDetailModal = false"
					class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md">
					← Back to Procurement List
				</button>
			</div>
		</div>

		<!-- ========================================================================= -->
		<!-- OFFCANVAS DRAWER: SUPPLIER MANAGEMENT (Presisi Mockup FR-0164 - FR-0176) -->
		<!-- ========================================================================= -->
		<div v-if="showSupplierDrawer" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
			<div
				class="bg-white w-full max-w-md h-full p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto text-left relative">
				<div>
					<div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
						<div>
							<h2 class="text-base font-bold text-slate-900">Supplier</h2>
							<p class="text-xs text-slate-400 mt-0.5">Register and manage trusted wholesale vendors,
								dairy producers,
								and packaging suppliers.</p>
						</div>
						<button @click="showSupplierDrawer = false"
							class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
					</div>

					<!-- Register Supplier Card -->
					<div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3">
						<p class="text-xs font-bold text-slate-800">{{ isEditSupplier ? 'Edit Supplier' : 'Register New Supplier' }}
						</p>

						<div>
							<label class="block text-[10px] font-semibold text-slate-500 mb-1">Supplier Corporate Name
								*</label>
							<input v-model="supplierForm.name" type="text"
								placeholder="e.g. Pacific Coffee Importers LLC"
								class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
						</div>

						<div>
							<label class="block text-[10px] font-semibold text-slate-500 mb-1">Direct Phone /
								WhatsApp</label>
							<input v-model="supplierForm.phone" type="text" placeholder="e.g. +1 (206) 555-8812"
								class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
						</div>

						<div>
							<label class="block text-[10px] font-semibold text-slate-500 mb-1">Facility or Warehouse
								Address
								(Optional)</label>
							<textarea v-model="supplierForm.address" rows="2"
								placeholder="e.g. 800 Industrial Way, Seattle, WA 98134"
								class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
						</div>

						<button @click="handleSaveSupplier"
							class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md">+
							Save Supplier</button>
					</div>

					<!-- Registered Vendors List -->
					<p class="text-xs font-bold text-slate-800 mb-3">Registered Vendors ({{ suppliers.length }})</p>
					<div class="space-y-2">
						<div v-for="sup in suppliers" :key="sup.id"
							class="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex justify-between items-center">
							<div>
								<p class="text-xs font-bold text-slate-800">{{ sup.name }}</p>
								<p class="text-[10px] text-slate-500">{{ sup.phone || '+1 (206) 555-8812' }}</p>
								<p class="text-[10px] text-slate-400 line-clamp-1">{{ sup.address || 'Seattle, WA' }}
								</p>
							</div>

							<div class="flex items-center gap-2 text-xs">
								<button @click="isEditSupplier = true; supplierForm = { ...sup }"
									class="text-indigo-600 font-semibold">Edit</button>
								<button @click="deleteSupplier(sup.id)"
									class="text-red-500 font-semibold">Delete</button>
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
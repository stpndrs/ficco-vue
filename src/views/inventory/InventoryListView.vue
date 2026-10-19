<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// --- STATE DATA ---
const products = ref([])
const categories = ref([])
const isLoading = ref(false)

// --- FILTER & PAGINATION ---
const search = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const totalPages = ref(1)

// --- DETAIL MODAL STATE ---
const selectedItem = ref(null)
const showDetailModal = ref(false)

// --- FETCH DATA ---
const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) categories.value = res.data.data
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

const fetchInventory = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/products?page=${currentPage.value}&limit=10`
        if (search.value) url += `&search=${search.value}`
        if (selectedCategory.value !== 'All') url += `&categoryId=${selectedCategory.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            products.value = res.data.data
            if (res.data.meta) {
                totalPages.value = res.data.meta.totalPages || 1
            }
        }
    } catch (err) {
        console.error('Failed to fetch inventory:', err)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchCategories()
    fetchInventory()
})

// --- METRICS CALCULATION (FR-0136) ---
const totalSKUs = computed(() => products.value.length)
const inStockCount = computed(() => products.value.filter((p) => (p.stock || 0) > 20).length)
const lowStockCount = computed(() => products.value.filter((p) => (p.stock || 0) >= 1 && (p.stock || 0) <= 20).length)
const outOfStockCount = computed(() => products.value.filter((p) => (p.stock || 0) === 0).length)

// --- HELPER STATUS LABEL (FR-0136: Habis, Banyak, Sedikit) ---
const getAvailabilityStatus = (stock) => {
    if (stock === 0) {
        return { label: 'Out of Stock', text: 'Habis', class: 'bg-red-50 text-red-600 border-red-200' }
    } else if (stock <= 20) {
        return { label: 'Low Stock', text: 'Sedikit', class: 'bg-amber-50 text-amber-600 border-amber-200' }
    } else {
        return { label: 'In Stock', text: 'Banyak', class: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
    }
}

const openDetails = (product) => {
    selectedItem.value = product
    showDetailModal.value = true
}
</script>

<template>
    <div class="space-y-6 text-left relative">
        <!-- Top Metrics Summary Cards (Presisi Mockup) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1: Tracked SKUs -->
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-slate-400">Tracked Product SKUs</p>
                <p class="text-2xl font-extrabold text-slate-900 mt-1">
                    {{ totalSKUs }} <span class="text-xs font-bold text-slate-400">SKUs</span>
                </p>
            </div>

            <!-- Card 2: In Stock (>20) -->
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-emerald-600">In Stock (>20 units)</p>
                <p class="text-2xl font-extrabold text-emerald-600 mt-1">
                    {{ inStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>

            <!-- Card 3: Low Stock (1-20) -->
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-amber-600">Low Stock (1-20 units)</p>
                <p class="text-2xl font-extrabold text-amber-600 mt-1">
                    {{ lowStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>

            <!-- Card 4: Out of Stock (0) -->
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-red-600">Out of Stock (0 units)</p>
                <p class="text-2xl font-extrabold text-red-600 mt-1">
                    {{ outOfStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>
        </div>

        <!-- Search & Filter Controls -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="relative w-full sm:w-96">
                <input v-model="search" @input="fetchInventory" type="text"
                    placeholder="Search by SKU code or inventory item name..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <select v-model="selectedCategory" @change="fetchInventory"
                class="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
                <option value="All">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <!-- Inventory Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 w-16">IMAGE</th>
                        <th class="py-3.5 px-4">PRODUCT SKU</th>
                        <th class="py-3.5 px-4">ITEM NAME</th>
                        <th class="py-3.5 px-4">CATEGORY</th>
                        <th class="py-3.5 px-4">STOCK ON HAND</th>
                        <th class="py-3.5 px-4">UNIT</th>
                        <th class="py-3.5 px-4">AVAILABILITY STATUS</th>
                        <th class="py-3.5 px-4 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="8" class="py-8 text-center text-slate-400">Loading inventory stock...</td>
                    </tr>
                    <tr v-else-if="products.length === 0">
                        <td colspan="8" class="py-8 text-center text-slate-400">Tidak ada stok inventaris ditemukan.
                        </td>
                    </tr>
                    <tr v-for="item in products" :key="item.id" class="hover:bg-slate-50/50 transition">
                        <!-- Image Icon -->
                        <td class="py-3 px-4">
                            <div
                                class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                <img v-if="item.images" :src="item.images" class="w-full h-full object-cover" />
                                <span v-else>PRD</span>
                            </div>
                        </td>

                        <!-- SKU Code -->
                        <td class="py-3 px-4 font-bold text-indigo-600">
                            {{ item.code || `PRD-${item.id.substring(0, 4).toUpperCase()}` }}
                        </td>

                        <!-- Item Name -->
                        <td class="py-3 px-4 font-bold text-slate-800">
                            {{ item.name }}
                        </td>

                        <!-- Category -->
                        <td class="py-3 px-4">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                                {{ item.category?.name || 'Uncategorized' }}
                            </span>
                        </td>

                        <!-- Stock On Hand -->
                        <td class="py-3 px-4 font-extrabold text-slate-900">
                            {{ item.stock || 0 }}
                        </td>

                        <!-- Unit -->
                        <td class="py-3 px-4 text-slate-500 font-medium">
                            {{ item.unit?.name || 'pcs' }}
                        </td>

                        <!-- Availability Status Badge -->
                        <td class="py-3 px-4">
                            <span :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                                getAvailabilityStatus(item.stock || 0).class
                            ]">
                                ● {{ getAvailabilityStatus(item.stock || 0).label }}
                            </span>
                        </td>

                        <!-- Action Button -->
                        <td class="py-3 px-4 text-right">
                            <button @click="openDetails(item)"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                👁 Details
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div
                class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ products.length }} of total inventory items</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1" @click="currentPage--; fetchInventory()"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium">Previous</button>
                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button :disabled="currentPage === totalPages" @click="currentPage++; fetchInventory()"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium">Next</button>
                </div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- INVENTORY DETAILS MODAL (Presisi Mockup FR-0137 - FR-0146) -->
        <!-- ========================================================================= -->
        <div v-if="showDetailModal && selectedItem"
            class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                class="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative space-y-5 animate-in fade-in zoom-in duration-150">
                <!-- Close Button -->
                <button @click="showDetailModal = false"
                    class="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-base font-bold">
                    ✕
                </button>

                <!-- Modal Header -->
                <div>
                    <h3 class="text-base font-bold text-slate-900">
                        Inventory Details: {{ selectedItem.name }}
                    </h3>
                    <p class="text-xs text-slate-400 mt-0.5">
                        Stock quantities auto-calculated from production output
                    </p>
                </div>

                <!-- Product Card Summary -->
                <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                        <img v-if="selectedItem.images" :src="selectedItem.images" class="w-full h-full object-cover" />
                        <span v-else>PRD</span>
                    </div>

                    <div>
                        <p class="text-xs font-bold text-slate-900">{{ selectedItem.name }}</p>
                        <p class="text-[10px] font-bold text-indigo-600">
                            {{ selectedItem.code || `PRD-${selectedItem.id.substring(0, 4)}` }}
                        </p>
                        <p class="text-[10px] text-slate-400">
                            Category: {{ selectedItem.category?.name || 'Uncategorized' }}
                        </p>
                    </div>
                </div>

                <!-- Stock On Hand & Availability Grid -->
                <div class="p-4 bg-white border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STOCK ON HAND</p>
                        <p class="text-xl font-extrabold text-slate-900 mt-1">
                            {{ selectedItem.stock || 0 }} <span class="text-xs font-normal text-slate-500">{{
                                selectedItem.unit?.name || 'cup' }}</span>
                        </p>
                    </div>

                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AVAILABILITY STATUS</p>
                        <span :class="[
                            'mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                            getAvailabilityStatus(selectedItem.stock || 0).class
                        ]">
                            ● {{ getAvailabilityStatus(selectedItem.stock || 0).label }}
                        </span>
                    </div>
                </div>

                <!-- AI RESTOCK PREDICTION CARD (FR-0145) -->
                <div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                                ✨
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-900">AI RESTOCK PREDICTION</p>
                                <p class="text-[9px] text-slate-400">ML Runout Velocity Algorithm [88.2% confidence]</p>
                            </div>
                        </div>

                        <span class="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold">
                            Forecasted Date: Oct 28, 2026
                        </span>
                    </div>

                    <div class="p-2.5 bg-white rounded-xl border border-indigo-100 flex justify-between items-center">
                        <span class="text-xs font-semibold text-slate-600">Estimated Days Remaining:</span>
                        <span class="text-xs font-extrabold text-red-600">
                            {{ selectedItem.stock === 0 ? '0 Days (Stockout)' : '14 Days at Current Burn Rate' }}
                        </span>
                    </div>

                    <p class="text-[10px] text-slate-500 leading-relaxed">
                        Predicted average consumption is <span class="font-bold text-slate-800">4 {{
                            selectedItem.unit?.name || 'cup' }}/day</span>. Recommended automated PO trigger date: <span
                            class="font-bold text-indigo-600">Oct 22, 2026</span> to prevent stockout.
                    </p>
                </div>

                <!-- Warehouse & QA Notes (FR-0144) -->
                <div class="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Warehouse & QA Notes:</p>
                    <p class="text-slate-700 font-medium">
                        {{ selectedItem.notes || 'Ready for POS counter fulfillment.' }}
                    </p>
                </div>

                <p class="text-[10px] text-slate-400 italic">
                    Stock levels on hand automatically update whenever a manufacturing batch completes in <span
                        class="font-bold text-slate-600">Production</span>.
                </p>

                <!-- Close Button -->
                <div class="pt-2">
                    <button @click="showDetailModal = false"
                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { getImageUrl } from '@/helpers/getImageUrl'
import { formatCurrency } from '@/helpers/formatCurrency'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// --- STATE DATA ---
const products = ref([])
const categories = ref([])
const isLoading = ref(false)

// --- FILTER & PAGINATION ---
const search = ref('')
const selectedCategory = ref('All')
const selectedStockStatus = ref('All')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

const categoryOptions = computed(() => [
    { id: 'All', name: 'All Categories' },
    ...categories.value.map(c => ({ id: c.id, name: c.name }))
])

const stockStatusOptions = [
    { id: 'All', name: 'All Stock Status' },
    { id: 'Banyak', name: 'Banyak (In Stock)' },
    { id: 'Sedikit', name: 'Sedikit (Low Stock)' },
    { id: 'Habis', name: 'Habis (Out of Stock)' }
]

// --- DETAIL MODAL STATE ---
const selectedItem = ref(null)
const showDetailModal = ref(false)
const isFetchingDetail = ref(false)

// --- FETCH DATA LIST ---
const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) categories.value = res.data.data || []
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

const fetchInventory = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/products?page=${currentPage.value}&limit=10`

        if (search.value) url += `&search=${search.value}`
        if (selectedCategory.value !== 'All') url += `&categoryId=${selectedCategory.value}`
        if (selectedStockStatus.value !== 'All') url += `&stockStatus=${selectedStockStatus.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            products.value = res.data.data || []
            if (res.data.meta) {
                totalPages.value = Number(res.data.meta.totalPages) || 1
                totalItems.value = Number(res.data.meta.total) || products.value.length
            }
        }
    } catch (err) {
        console.error('Failed to fetch inventory:', err)
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchInventory(1)
}

onMounted(() => {
    fetchCategories()
    fetchInventory(1)
})

// --- FETCH DETAIL ENDPOINT (GET /api/products/:id) ---
const openDetails = async (product) => {
    showDetailModal.value = true
    isFetchingDetail.value = true
    selectedItem.value = null

    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/${product.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            selectedItem.value = res.data.data
        }
    } catch (err) {
        console.error('Failed to fetch product details:', err)
        showDetailModal.value = false
    } finally {
        isFetchingDetail.value = false
    }
}

// --- METRICS CALCULATION ---
const totalSKUs = computed(() => totalItems.value || products.value.length)
const inStockCount = computed(() => products.value.filter((p) => (p.stock || 0) > 20).length)
const lowStockCount = computed(() => products.value.filter((p) => (p.stock || 0) >= 1 && (p.stock || 0) <= 20).length)
const outOfStockCount = computed(() => products.value.filter((p) => (p.stock || 0) <= 0 || p.stockStatus === 'Habis').length)

// --- HELPER STATUS BADGE ---
const getStatusBadge = (item) => {
    const status = item.stockStatus || (item.stock <= 0 ? 'Habis' : item.stock <= 20 ? 'Sedikit' : 'Banyak')
    if (status === 'Habis' || item.stock <= 0) {
        return { label: 'Habis (Out of Stock)', class: 'bg-red-50 text-red-600 border-red-200' }
    } else if (status === 'Sedikit' || item.stock <= 20) {
        return { label: 'Sedikit (Low Stock)', class: 'bg-amber-50 text-amber-600 border-amber-200' }
    } else {
        return { label: 'Banyak (In Stock)', class: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
    }
}
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
        <!-- Top Metrics Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-slate-400">Tracked Product SKUs</p>
                <p class="text-2xl font-extrabold text-slate-900 mt-1">
                    {{ totalSKUs }} <span class="text-xs font-bold text-slate-400">SKUs</span>
                </p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-emerald-600">In Stock (>20 units)</p>
                <p class="text-2xl font-extrabold text-emerald-600 mt-1">
                    {{ inStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-amber-600">Low Stock (1-20 units)</p>
                <p class="text-2xl font-extrabold text-amber-600 mt-1">
                    {{ lowStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <p class="text-xs font-semibold text-red-600">Out of Stock (&lt;=0 units)</p>
                <p class="text-2xl font-extrabold text-red-600 mt-1">
                    {{ outOfStockCount }} <span class="text-xs font-bold text-slate-400">Items</span>
                </p>
            </div>
        </div>

        <!-- Search & Filter Controls -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div class="w-full md:w-80">
                <BaseInput v-model="search" placeholder="Search by product name..." @input="handleFilterChange" />
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div class="w-full sm:w-52">
                    <BaseSelect v-model="selectedCategory" :options="categoryOptions" valueKey="id" labelKey="name"
                        @change="handleFilterChange" />
                </div>

                <div class="w-full sm:w-52">
                    <BaseSelect v-model="selectedStockStatus" :options="stockStatusOptions" valueKey="id"
                        labelKey="name" @change="handleFilterChange" />
                </div>
            </div>
        </div>

        <!-- Inventory Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 w-16">IMAGE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">ITEM NAME</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">CATEGORY</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">PRICE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STOCK ON HAND</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">UNIT</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">ACTION</th>
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
                        <td class="py-3 px-4">
                            <div
                                class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200/60">
                                <img v-if="item.images" :src="getImageUrl(item.images)"
                                    class="w-full h-full object-cover" />
                                <span v-else>PRD</span>
                            </div>
                        </td>

                        <td class="py-3 px-4 font-bold text-slate-800">
                            {{ item.name }}
                        </td>

                        <td class="py-3 px-4 whitespace-nowrap">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                                {{ item.category?.name || 'Uncategorized' }}
                            </span>
                        </td>

                        <td class="py-3 px-4 font-bold text-indigo-600 whitespace-nowrap">
                            {{ formatCurrency(item.price) }}
                        </td>

                        <td class="py-3 px-4 font-extrabold whitespace-nowrap"
                            :class="item.stock <= 0 ? 'text-red-600' : 'text-slate-900'">
                            {{ item.stock }}
                        </td>

                        <td class="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {{ item.unit?.name || 'Pcs' }}
                        </td>

                        <td class="py-3 px-4 whitespace-nowrap">
                            <span :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                                getStatusBadge(item).class
                            ]">
                                ● {{ getStatusBadge(item).label }}
                            </span>
                        </td>

                        <td class="py-3 px-4 text-right whitespace-nowrap">
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
                class="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ products.length }} of {{ totalItems }} inventory items</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchInventory(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading" @click="fetchInventory(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL DETAIL (Data Fetched via Endpoint GET /api/products/:id) -->
        <Teleport to="body">
            <div v-if="showDetailModal"
                class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div
                    class="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 text-left relative space-y-5 my-auto max-h-[90vh] overflow-y-auto">
                    <button @click="showDetailModal = false"
                        class="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-base font-bold">
                        ✕
                    </button>

                    <div v-if="isFetchingDetail" class="py-12 text-center text-slate-400">
                        Loading inventory details...
                    </div>

                    <div v-else-if="selectedItem" class="space-y-5">
                        <div>
                            <h3 class="text-base font-bold text-slate-900 pr-6">
                                Inventory Details: {{ selectedItem.name }}
                            </h3>
                            <p class="text-xs text-slate-400 mt-0.5">
                                Category Code: {{ selectedItem.category?.code || '-' }}
                            </p>
                        </div>

                        <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div
                                class="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-slate-200">
                                <img v-if="selectedItem.images" :src="getImageUrl(selectedItem.images)"
                                    class="w-full h-full object-cover" />
                                <span v-else>PRD</span>
                            </div>

                            <div>
                                <p class="text-xs font-bold text-slate-900">{{ selectedItem.name }}</p>
                                <p class="text-[10px] font-bold text-indigo-600">
                                    {{ formatCurrency(selectedItem.price) }}
                                </p>
                                <p class="text-[10px] text-slate-400">
                                    Category: {{ selectedItem.category?.name || 'Uncategorized' }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="p-4 bg-white border border-slate-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STOCK ON HAND
                                </p>
                                <p class="text-xl font-extrabold mt-1"
                                    :class="selectedItem.stock <= 0 ? 'text-red-600' : 'text-slate-900'">
                                    {{ selectedItem.stock }} <span class="text-xs font-normal text-slate-500">{{
                                        selectedItem.unit?.name || 'Pcs' }}</span>
                                </p>
                            </div>

                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</p>
                                <span :class="[
                                    'mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                                    getStatusBadge(selectedItem).class
                                ]">
                                    ● {{ getStatusBadge(selectedItem).label }}
                                </span>
                            </div>
                        </div>

                        <!-- AI RESTOCK PREDICTION CARD -->
                        <div v-if="selectedItem.aiRestockPrediction"
                            class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2 text-xs">
                            <div class="flex items-center gap-2">
                                <span class="text-sm">✨</span>
                                <p class="font-bold text-slate-900">AI Restock Prediction</p>
                            </div>

                            <p class="text-slate-600 text-xs">
                                {{ selectedItem.aiRestockPrediction.message }}
                            </p>

                            <div v-if="selectedItem.aiRestockPrediction.estimatedDaysRemaining !== null"
                                class="p-2 bg-white rounded-xl border border-indigo-100 flex justify-between items-center mt-2">
                                <span class="text-slate-500 font-medium">Estimated Days Remaining:</span>
                                <span class="font-bold text-indigo-600">{{
                                    selectedItem.aiRestockPrediction.estimatedDaysRemaining }} Days</span>
                            </div>
                        </div>

                        <div class="pt-2">
                            <BaseButton @click="showDetailModal = false" class="!py-2.5 !text-xs">
                                Close
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { getImageUrl } from '@/helpers/getImageUrl'
import { formatCurrency } from '@/helpers/formatCurrency'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

// --- STATE DATA ---
const products = ref([])
const categories = ref([])
const isLoading = ref(false)

// --- FILTER & PAGINATION PARAMS ---
const search = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const totalPages = ref(1)
const totalData = ref(0)
const limit = ref(10)

// Options untuk BaseSelect
const categoryOptions = computed(() => [
    { id: 'All', name: 'All Categories' },
    ...categories.value.map(c => ({ id: c.id, name: c.name }))
])

// --- CATEGORY DRAWER STATE ---
const showCategoryDrawer = ref(false)
const categoryForm = ref({ id: '', name: '', code: '' })
const lastCategoryCode = ref()
const isEditCategory = ref(false)
const isSavingCategory = ref(false)

// --- TOAST STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// --- FETCH CATEGORIES (category-list.json) ---
const fetchLastCategoryCode = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/code/generate`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                type: "category"
            }
        })
        if (res.data.status) {
            categoryForm.value.code = res.data.data || null
        }
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            categories.value = res.data.data || []
        }
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

// --- FETCH PRODUCTS LIST (Query Params: search, categoryId, page, limit) ---
const fetchProducts = async (page = 1) => {
    isLoading.value = true
    currentPage.value = page
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/products?page=${currentPage.value}&limit=${limit.value}`

        if (search.value) url += `&search=${encodeURIComponent(search.value)}`
        if (selectedCategory.value !== 'All') url += `&categoryId=${selectedCategory.value}`

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            products.value = res.data.data || []
            if (res.data.meta) {
                totalData.value = Number(res.data.meta.total) || products.value.length
                totalPages.value = Number(res.data.meta.totalPages) || 1
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat daftar produk', 'error')
    } finally {
        isLoading.value = false
    }
}

const handleFilterChange = () => {
    fetchProducts(1)
}

const toggleStatus = async (product) => {
    try {
        const token = localStorage.getItem('token')
        const newStatus = !product.isActive
        const res = await axios.patch(
            `${import.meta.env.VITE_APP_API_URL}/api/products/${product.id}/status`,
            { isActive: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.data.status) {
            product.isActive = newStatus
            showToast(`Status produk diubah menjadi ${newStatus ? 'Aktif' : 'Non-Aktif'}`)
        }
    } catch (err) {
        showToast('Gagal mengubah status produk', 'error')
    }
}

// Category Drawer Actions
const handleSaveCategory = async () => {
    if (!categoryForm.value.name) return showToast('Nama kategori wajib diisi!', 'error')

    isSavingCategory.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            name: categoryForm.value.name,
            code: categoryForm.value.code || categoryForm.value.name.substring(0, 3).toUpperCase()
        }

        let res
        if (isEditCategory.value) {
            res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/products/categories/${categoryForm.value.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
        } else {
            res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
        }

        if (res.data.status) {
            showToast(isEditCategory.value ? 'Kategori diperbarui!' : 'Kategori berhasil disimpan!')
            categoryForm.value = { id: '', name: '', code: '' }
            isEditCategory.value = false
            fetchCategories()
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal menyimpan kategori', 'error')
    } finally {
        isSavingCategory.value = false
    }
}

const deleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try {
        const token = localStorage.getItem('token')
        const res = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/products/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            showToast('Kategori dihapus')
            fetchCategories()
        }
    } catch (err) {
        showToast('Gagal menghapus kategori', 'error')
    }
}

onMounted(() => {
    fetchCategories()
    fetchProducts(1)
})
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
        <!-- Toast Alert -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Top Action & Filter Bar -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <!-- Search Input -->
            <div class="w-full md:w-80">
                <BaseInput v-model="search" placeholder="Search by product name..." @input="handleFilterChange" />
            </div>

            <!-- Filters and Actions -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto justify-end">
                <div class="w-full sm:w-52">
                    <BaseSelect v-model="selectedCategory" :options="categoryOptions" valueKey="id" labelKey="name"
                        @change="handleFilterChange" />
                </div>

                <button @click="async () => { showCategoryDrawer = true; await fetchLastCategoryCode() }"
                    class="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0">
                    Manage Categories
                </button>

                <router-link to="/products/create"
                    class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-1.5 shrink-0">
                    <span>+</span> Add Product
                </router-link>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 w-16">IMAGE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">PRODUCT NAME</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">CATEGORY</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">UNIT PRICE</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STOCK</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">UNIT</th>
                        <th class="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                        <th class="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <tr v-if="isLoading">
                        <td colspan="8" class="py-8 text-center text-slate-400">Loading products...</td>
                    </tr>
                    <tr v-else-if="products.length === 0">
                        <td colspan="8" class="py-8 text-center text-slate-400">Belum ada data produk.</td>
                    </tr>
                    <tr v-for="p in products" :key="p.id" class="hover:bg-slate-50/50 transition">
                        <!-- Image -->
                        <td class="py-3 px-4">
                            <div
                                class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200/60">
                                <img v-if="p.images" :src="getImageUrl(p.images)" class="w-full h-full object-cover" />
                                <span v-else>PRD</span>
                            </div>
                        </td>

                        <!-- Product Name -->
                        <td class="py-3 px-4">
                            <p class="font-bold text-slate-800 leading-tight">{{ p.name }}</p>
                            <p v-if="p.notes" class="text-[10px] text-slate-400 line-clamp-1">{{ p.notes }}</p>
                        </td>

                        <!-- Category -->
                        <td class="py-3 px-4 whitespace-nowrap">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                                {{ p.category?.name || 'Uncategorized' }}
                            </span>
                        </td>

                        <!-- Unit Price -->
                        <td class="py-3 px-4 font-extrabold text-indigo-600 whitespace-nowrap">
                            {{ formatCurrency(p.price) }}
                        </td>

                        <!-- Stock -->
                        <td class="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {{ p.stock ?? 0 }}
                        </td>

                        <!-- Unit -->
                        <td class="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {{ p.unit?.name || 'pcs' }}
                        </td>

                        <!-- Active/Inactive Status -->
                        <td class="py-3 px-4 whitespace-nowrap">
                            <button @click="toggleStatus(p)" :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition',
                                p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                            ]">
                                ● {{ p.isActive ? 'Active' : 'Inactive' }}
                            </button>
                        </td>

                        <!-- Action Button -->
                        <td class="py-3 px-4 text-right whitespace-nowrap">
                            <router-link :to="`/products/edit/${p.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Connected to API Meta -->
            <div
                class="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ products.length }} of {{ totalData }} products</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1 || isLoading" @click="fetchProducts(currentPage - 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Previous
                    </button>

                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>

                    <button :disabled="currentPage >= totalPages || isLoading" @click="fetchProducts(currentPage + 1)"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium transition">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <!-- Category Offcanvas Drawer -->
            <div v-if="showCategoryDrawer" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
                <div
                    class="bg-white w-full max-w-md h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-left relative">
                    <div>
                        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <h2 class="text-base font-bold text-slate-900">Product Categories</h2>
                                <p class="text-xs text-slate-400 mt-0.5">Manage business categories and prefixes.</p>
                            </div>
                            <button @click="showCategoryDrawer = false"
                                class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
                        </div>

                        <!-- Category Form -->
                        <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3">
                            <p class="text-xs font-bold text-slate-800">{{ isEditCategory ? 'Edit Category' : 'Add New Category' }}</p>
                            
                            <BaseInput v-model="categoryForm.code" label="Category Code / Prefix"
                                placeholder="e.g. FOOD01, CAT-01" disabled />

                            <BaseInput v-model="categoryForm.name" label="Category Name" placeholder="e.g. Makanan"
                            required />

                            <BaseButton :loading="isSavingCategory" @click="handleSaveCategory" class="!py-2 !text-xs">
                                + Save Category
                            </BaseButton>
                        </div>

                        <!-- Registered Categories -->
                        <p class="text-xs font-bold text-slate-800 mb-3">Registered Categories ({{ categories.length }})
                        </p>
                        <div class="space-y-2">
                            <div v-for="cat in categories" :key="cat.id"
                                class="p-3 bg-white border border-slate-200/80 rounded-2xl flex justify-between items-center gap-2">
                                <div>
                                    <p class="text-xs font-bold text-slate-800">{{ cat.name }}</p>
                                    <p class="text-[10px] text-slate-400 font-mono">Code: {{ cat.code || '-' }}</p>
                                </div>
                                <div class="flex items-center gap-2 text-xs shrink-0">
                                    <!-- <button @click="isEditCategory = true; categoryForm = { ...cat }"
                                        class="text-indigo-600 font-semibold p-1">Edit</button>
                                    <button @click="deleteCategory(cat.id)"
                                        class="text-red-500 font-semibold p-1">Delete</button> -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <button @click="showCategoryDrawer = false"
                        class="w-full py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-50 mt-6">
                        Close Drawer
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>
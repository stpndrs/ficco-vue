<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const products = ref([])
const categories = ref([])
const search = ref('')
const selectedCategory = ref('All')
const isLoading = ref(false)

const currentPage = ref(1)
const totalPages = ref(1)
const totalData = ref(0)

const showCategoryDrawer = ref(false)
const categoryForm = ref({ id: '', name: '', code: '' })
const isEditCategory = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

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

const fetchProducts = async () => {
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
                totalData.value = res.data.meta.total || res.data.data.length
                totalPages.value = res.data.meta.totalPages || 1
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat daftar produk', 'error')
    } finally {
        isLoading.value = false
    }
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
    fetchProducts()
})

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

        <!-- Top Action Bar -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="relative w-full sm:w-96">
                <input v-model="search" @input="fetchProducts" type="text"
                    placeholder="Search by SKU code or product name..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select v-model="selectedCategory" @change="fetchProducts"
                    class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-600">
                    <option value="All">All Categories</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                    </option>
                </select>

                <button @click="showCategoryDrawer = true"
                    class="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0">
                    Manage Categories
                </button>

                <router-link to="/products/create"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5 shrink-0">
                    <span>+</span> Add Product
                </router-link>
            </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-3.5 px-4 w-16">IMAGE</th>
                        <th class="py-3.5 px-4">PRODUCT SKU</th>
                        <th class="py-3.5 px-4">PRODUCT NAME</th>
                        <th class="py-3.5 px-4">CATEGORY</th>
                        <th class="py-3.5 px-4">UNIT PRICE</th>
                        <th class="py-3.5 px-4">UNIT</th>
                        <th class="py-3.5 px-4">STATUS</th>
                        <th class="py-3.5 px-4 text-right">ACTIONS</th>
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
                        <td class="py-3 px-4">
                            <div
                                class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                <img v-if="p.images" :src="p.images" class="w-full h-full object-cover" />
                                <span v-else>PRD</span>
                            </div>
                        </td>
                        <td class="py-3 px-4 font-bold text-indigo-600">{{ p.code || `PRD-${p.id.substring(0, 4)}` }}
                        </td>
                        <td class="py-3 px-4">
                            <p class="font-bold text-slate-800 leading-tight">{{ p.name }}</p>
                            <p v-if="p.notes" class="text-[10px] text-slate-400 line-clamp-1">{{ p.notes }}</p>
                        </td>
                        <td class="py-3 px-4">
                            <span
                                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/60">
                                {{ p.category?.name || 'Uncategorized' }}
                            </span>
                        </td>
                        <td class="py-3 px-4 font-extrabold text-slate-900">{{ formatCurrency(p.price) }}</td>
                        <td class="py-3 px-4 text-slate-500 font-medium">{{ p.unit?.name || 'pcs' }}</td>
                        <td class="py-3 px-4">
                            <button @click="toggleStatus(p)" :class="[
                                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition',
                                p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                            ]">
                                ● {{ p.isActive ? 'Active' : 'Inactive' }}
                            </button>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <router-link :to="`/products/edit/${p.id}`"
                                class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1">
                                Edit
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div
                class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>Showing {{ products.length }} of {{ totalData }} products</p>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1" @click="currentPage--; fetchProducts()"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
                    <span class="font-semibold text-slate-700">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button :disabled="currentPage === totalPages" @click="currentPage++; fetchProducts()"
                        class="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
                </div>
            </div>
        </div>

        <!-- Category Offcanvas Drawer -->
        <div v-if="showCategoryDrawer" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
            <div
                class="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-left relative">
                <div>
                    <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                        <div>
                            <h2 class="text-base font-bold text-slate-900">Product Categories</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Manage business categories and prefixes.</p>
                        </div>
                        <button @click="showCategoryDrawer = false"
                            class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3">
                        <p class="text-xs font-bold text-slate-800">{{ isEditCategory ? 'Edit Category' : 'Add New Category' }}</p>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Category Name *</label>
                            <input v-model="categoryForm.name" type="text" placeholder="e.g. Specialty Beverages"
                                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Category Prefix
                                Code</label>
                            <input v-model="categoryForm.code" type="text" placeholder="e.g. BEV, BAK"
                                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                        </div>
                        <button @click="handleSaveCategory"
                            class="w-full py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md">+
                            Save Category</button>
                    </div>

                    <p class="text-xs font-bold text-slate-800 mb-3">Registered Categories ({{ categories.length }})</p>
                    <div class="space-y-2">
                        <div v-for="cat in categories" :key="cat.id"
                            class="p-3 bg-white border border-slate-200/80 rounded-xl flex justify-between items-center">
                            <div>
                                <p class="text-xs font-bold text-slate-800">{{ cat.name }}</p>
                                <p class="text-[10px] text-slate-400 font-mono">Prefix: {{ cat.code || 'BEV' }}</p>
                            </div>
                            <div class="flex items-center gap-2 text-xs">
                                <button @click="isEditCategory = true; categoryForm = { ...cat }"
                                    class="text-indigo-600 font-semibold">Edit</button>
                                <button @click="deleteCategory(cat.id)"
                                    class="text-red-500 font-semibold">Delete</button>
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
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const selectedCategory = ref('All')
const searchQuery = ref('')
const cart = ref([])

const form = ref({
    id: '',
    code: '',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Tunai',
    paymentProof: null,
    notes: '',
    status: 'draft'
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const validationMessage = ref({})

// --- TOAST NOTIFICATION STATE ---
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchInitialData = async () => {
    try {
        const token = localStorage.getItem('token')
        const [catRes, prodRes, orderRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/sales/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (catRes.data.status) categories.value = catRes.data.data || []
        if (prodRes.data.status) products.value = prodRes.data.data || []

        if (orderRes.data.status) {
            const data = orderRes.data.data
            form.value = {
                id: data.id,
                code: data.code,
                customerName: data.customerName || '',
                customerPhone: data.customerPhone || '',
                paymentMethod: data.paymentMethod || 'Tunai',
                paymentProof: data.paymentProof || null,
                notes: data.notes || '',
                status: data.status || 'draft'
            }

            // Populasi keranjang belanja dari detail pesanan lama
            cart.value = (data.saleDetails || []).map((d) => ({
                productId: d.productId,
                name: d.product?.name || 'Item Product',
                price: Number(d.price),
                qty: Number(d.qty)
            }))
        }
    } catch (err) {
        showToast('Gagal memuat data transaksi', 'error')
    }
}

onMounted(fetchInitialData)

const filteredProducts = computed(() => {
    return products.value.filter((p) => {
        const matchCat = selectedCategory.value === 'All' || p.categoryId === selectedCategory.value
        const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchCat && matchSearch
    })
})

const addToCart = (product) => {
    const existing = cart.value.find((i) => i.productId === product.id)
    if (existing) {
        existing.qty += 1
    } else {
        cart.value.push({ productId: product.id, name: product.name, price: Number(product.price), qty: 1 })
    }
}

const updateQty = (id, delta) => {
    const item = cart.value.find((i) => i.productId === id)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) cart.value = cart.value.filter((i) => i.productId !== id)
}

const getQty = (id) => cart.value.find((i) => i.productId === id)?.qty || 0

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))

const handleSaveChanges = async () => {
    if (cart.value.length === 0) {
        errorMessage.value = 'Keranjang belanja tidak boleh kosong!'
        return
    }

    isSubmitting.value = true
    errorMessage.value = ''
    validationMessage.value = {}

    try {
        const token = localStorage.getItem('token')
        const payload = {
            ...form.value,
            items: cart.value.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price }))
        }

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/sales/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            showToast('Pesanan berhasil diperbarui!')
            router.push('/sales/history')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal memperbarui pesanan. Periksa inputan Anda.'
        validationMessage.value = err.response?.data?.errors || {}
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4">
        <!-- Toast Notification -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Top Nav Tabs -->
        <div class="flex flex-wrap items-center gap-2">
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

        <!-- Alert Error Global -->
        <div v-if="errorMessage"
            class="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage }}</span>
        </div>

        <!-- Customer Details Top Card -->
        <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Customer & Transaction Details (#{{ form.code }})
                </p>
                <router-link to="/sales/history"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back to List
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <BaseInput v-model="form.customerName" label="Customer Full Name *"
                    placeholder="Masukkan nama pelanggan" :error="validationMessage?.customerName?.[0] || null"
                    required />
                <BaseInput v-model="form.customerPhone" label="Customer Phone (Optional)"
                    placeholder="Contoh: 081234567890" :error="validationMessage?.customerPhone?.[0] || null" />
                <BaseSelect v-model="form.paymentMethod" label="Payment Method" :options="[
                    { id: 'cash', name: 'Cash' },
                    { id: 'transfer', name: 'Bank Transfer' }
                ]" :error="validationMessage?.paymentMethod?.[0] || null" />
                <!-- Added Status Select Field -->
                <BaseSelect v-model="form.status" label="Transaction Status *" :options="[
                    { id: 'paid', name: 'Paid' },
                    { id: 'draft', name: 'Draft' },
                    { id: 'pending', name: 'Pending' },
                    { id: 'done', name: 'Done' },
                    { id: 'cancel', name: 'Cancel' }
                ]" :error="validationMessage?.status?.[0] || null" />
            </div>
        </div>

        <!-- Main Catalog & Cart Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Menu Items Catalog -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div class="flex flex-wrap gap-1.5">
                        <button @click="selectedCategory = 'All'"
                            :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition', selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50']">
                            All
                        </button>
                        <button v-for="c in categories" :key="c.id" @click="selectedCategory = c.id"
                            :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition', selectedCategory === c.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50']">
                            {{ c.name }}
                        </button>
                    </div>

                    <div class="w-full sm:w-56">
                        <BaseInput v-model="searchQuery" placeholder="Search product..." />
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div v-for="p in filteredProducts" :key="p.id" @click="addToCart(p)"
                        class="relative bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between">
                        <span v-if="getQty(p.id) > 0"
                            class="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            {{ getQty(p.id) }} in cart
                        </span>

                        <div
                            class="w-full h-20 sm:h-24 rounded-xl bg-slate-100 flex items-center justify-center mb-3 overflow-hidden border border-slate-100">
                            <img v-if="p.images" :src="p.images" class="w-full h-full object-cover" />
                            <svg v-else class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400 font-mono">{{ p.code || 'PRD' }}</p>
                            <p class="text-xs font-bold text-slate-800 line-clamp-1">{{ p.name }}</p>
                        </div>

                        <div class="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                            <span class="text-xs font-bold text-indigo-600">{{ formatCurrency(p.price) }}</span>
                            <button
                                class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center">+</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Order & Checkout Panel -->
            <div
                class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-fit space-y-4">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">Order Items &
                        Checkout</h3>

                    <!-- Items list -->
                    <div class="space-y-2.5 mb-4 max-h-60 overflow-y-auto">
                        <div v-if="cart.length === 0" class="text-center py-8 text-slate-400 text-xs">
                            Klik produk di katalog untuk menambahkan ke keranjang.
                        </div>

                        <div v-for="item in cart" :key="item.productId"
                            class="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                            <div class="pr-2">
                                <p class="text-xs font-bold text-slate-800 line-clamp-1">{{ item.name }}</p>
                                <p class="text-[10px] text-slate-400">{{ formatCurrency(item.price) }}</p>
                            </div>

                            <div class="flex items-center gap-2 shrink-0">
                                <div class="flex items-center border border-slate-200 rounded-lg bg-white">
                                    <button @click="updateQty(item.productId, -1)"
                                        class="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100">-</button>
                                    <span class="px-2 text-xs font-bold text-slate-800">{{ item.qty }}</span>
                                    <button @click="updateQty(item.productId, 1)"
                                        class="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100">+</button>
                                </div>
                                <span class="text-xs font-bold text-slate-900 w-14 text-right">{{
                                    formatCurrency(item.price * item.qty) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Notes -->
                    <BaseInput v-model="form.notes" label="Order Notes / Memo" placeholder="Catatan khusus pesanan..."
                        :error="validationMessage?.notes?.[0] || null" />

                    <!-- Total Calculations -->
                    <div class="space-y-1.5 pt-4 border-t border-slate-100 mt-4 text-xs">
                        <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{{
                            formatCurrency(subtotal) }}</span></div>
                        <div
                            class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                            <span>Total</span><span class="text-indigo-600">{{ formatCurrency(subtotal) }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2">
                    <router-link to="/sales/history"
                        class="py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl text-center">
                        Cancel
                    </router-link>
                    <BaseButton :loading="isSubmitting" @click="handleSaveChanges" class="!py-2.5 !text-xs">
                        ✓ Save Changes
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>
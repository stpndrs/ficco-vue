<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const products = ref([])
const categories = ref([])
const selectedCategory = ref('All')
const searchQuery = ref('')
const cart = ref([])

const form = ref({
    transactionCode: 'TXN-0004',
    customerName: 'Emily Carter',
    customerPhone: '+1 (206) 555-0144',
    paymentMethod: 'Card / POS',
    paymentProof: 'receipt_card_pos.png',
    notes: '',
    status: 'Paid'
})

const isSubmitting = ref(false)

const fetchData = async () => {
    try {
        const token = localStorage.getItem('token')
        const [catRes, prodRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        if (catRes.data.status) categories.value = catRes.data.data
        if (prodRes.data.status) products.value = prodRes.data.data
    } catch (err) {
        console.error('Failed to load POS data:', err)
    }
}

onMounted(fetchData)

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

const handlePlaceOrder = async (isDraft = false) => {
    if (cart.value.length === 0) return alert('Keranjang belanja kosong!')
    isSubmitting.value = true

    try {
        const token = localStorage.getItem('token')
        const payload = {
            status: isDraft ? 'Draft' : form.value.status,
            customerName: form.value.customerName,
            customerPhone: form.value.customerPhone,
            paymentMethod: form.value.paymentMethod,
            paymentProof: form.value.paymentProof,
            notes: form.value.notes,
            items: cart.value.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price }))
        }

        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/sales`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/sales/history')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memproses pesanan')
    } finally {
        isSubmitting.value = false
    }
}

const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`
</script>

<template>
    <div class="space-y-6 text-left">
        <!-- Top Nav Tabs -->
        <div class="flex items-center gap-2">
            <router-link to="/sales"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-200">
                + New Order
            </router-link>
            <router-link to="/sales/history"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50">
                Transaction History
            </router-link>
        </div>

        <!-- Customer Details Top Card -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Customer & Transaction Details
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Transaction Code (ReadOnly)</label>
                    <input type="text" :value="form.transactionCode" disabled
                        class="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Customer Full Name *</label>
                    <input v-model="form.customerName" type="text"
                        class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Customer Phone (Optional)</label>
                    <input v-model="form.customerPhone" type="text"
                        class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>
            </div>
        </div>

        <!-- Main Catalog & Cart Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Menu Items Catalog -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

                    <input v-model="searchQuery" type="text" placeholder="Search item name or SKU..."
                        class="w-full sm:w-56 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div v-for="p in filteredProducts" :key="p.id" @click="addToCart(p)"
                        class="relative bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between">
                        <span v-if="getQty(p.id) > 0"
                            class="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {{ getQty(p.id) }} in cart
                        </span>

                        <div
                            class="w-full h-24 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                            <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-slate-400">PRD-1001</p>
                            <p class="text-xs font-bold text-slate-800 line-clamp-1">{{ p.name }}</p>
                        </div>

                        <div class="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                            <span class="text-xs font-bold text-indigo-600">{{ formatCurrency(p.price) }}</span>
                            <button class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">+</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Order & Checkout Panel -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-sm font-bold text-slate-900">Order & Checkout</h3>
                        <span class="text-xs font-bold text-slate-400">TXN-0004</span>
                    </div>

                    <!-- Items list -->
                    <div class="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        <div v-if="cart.length === 0" class="text-center py-8 text-slate-400 text-xs">
                            Klik produk di katalog untuk menambahkan ke keranjang.
                        </div>

                        <div v-for="item in cart" :key="item.productId"
                            class="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                            <div>
                                <p class="text-xs font-bold text-slate-800">{{ item.name }}</p>
                                <p class="text-[10px] text-slate-400">{{ formatCurrency(item.price) }} each</p>
                            </div>

                            <div class="flex items-center gap-2">
                                <div class="flex items-center border border-slate-200 rounded-lg bg-white">
                                    <button @click="updateQty(item.productId, -1)"
                                        class="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100">-</button>
                                    <span class="px-2 text-xs font-bold text-slate-800">{{ item.qty }}</span>
                                    <button @click="updateQty(item.productId, 1)"
                                        class="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100">+</button>
                                </div>
                                <span class="text-xs font-bold text-slate-900 w-12 text-right">{{
                                    formatCurrency(item.price * item.qty) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Details -->
                    <div class="space-y-3 pt-4 border-t border-slate-100 text-left">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Payment Method</label>
                            <select v-model="form.paymentMethod"
                                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                                <option value="Card / POS">Card / POS</option>
                                <option value="Tunai">Tunai / Cash</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Order Notes / Table
                                No.</label>
                            <input v-model="form.notes" type="text"
                                placeholder="e.g. Dine-in Table 4, oat milk substitution"
                                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                        </div>
                    </div>

                    <div class="space-y-1.5 pt-4 border-t border-slate-100 mt-4 text-xs">
                        <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{{
                            formatCurrency(subtotal) }}</span></div>
                        <div class="flex justify-between text-slate-500"><span>Discount</span><span
                                class="text-emerald-600">-$0.00</span></div>
                        <div
                            class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                            <span>Total</span><span class="text-indigo-600">{{ formatCurrency(subtotal) }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mt-6">
                    <button @click="handlePlaceOrder(true)"
                        class="py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl">
                        Cancel
                    </button>
                    <button @click="handlePlaceOrder(false)"
                        class="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200">
                        Save & Place Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
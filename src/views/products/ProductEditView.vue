<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const units = ref([])
const isSubmitting = ref(false)

const form = ref({
    id: '',
    name: '',
    price: '',
    code: '',
    unitId: '',
    categoryId: '',
    images: '',
    notes: ''
})

const fetchProductAndDropdowns = async () => {
    try {
        const token = localStorage.getItem('token')
        const [catRes, prodRes] = await Promise.all([
            axios.get('http://localhost:5000/api/products/categories', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:5000/api/products/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (catRes.data.status) categories.value = catRes.data.data
        if (prodRes.data.status) {
            const p = prodRes.data.data
            form.value = {
                id: p.id,
                name: p.name,
                price: p.price,
                code: p.code || `PRD-${p.id.substring(0, 4)}`,
                unitId: p.unitId || '',
                categoryId: p.categoryId || '',
                images: p.images || '',
                notes: p.notes || ''
            }
        }
    } catch (err) {
        alert('Gagal mengambil data produk')
    }
}

onMounted(fetchProductAndDropdowns)

const handleSaveChanges = async () => {
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            name: form.value.name,
            price: Number(form.value.price),
            categoryId: form.value.categoryId || null,
            unitId: form.value.unitId || null,
            images: form.value.images || null,
            notes: form.value.notes || null
        }

        const res = await axios.put(`http://localhost:5000/api/products/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/products')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal merubah data produk')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Edit Product: {{ form.code }}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Update product name, category, pricing, or catalog
                        specifications.</p>
                </div>
                <router-link to="/products"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back to Catalog
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                    <input v-model="form.name" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Unit Price ($) *</label>
                    <input v-model="form.price" type="number" step="0.01"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Product SKU (ReadOnly)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-bold" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Measurement Unit</label>
                    <input v-model="form.unitId" type="text" placeholder="cup / pcs"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <select v-model="form.categoryId"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Product Image URL</label>
                    <input v-model="form.images" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Description & Notes</label>
                    <textarea v-model="form.notes" rows="3"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/products"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSaveChanges" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Changes
                </button>
            </div>
        </div>
    </div>
</template>
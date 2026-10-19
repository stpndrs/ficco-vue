<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const units = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const existingImage = ref('')
const imagePreview = ref('')

const form = ref({
    id: '',
    name: '',
    price: '',
    code: '',
    unitId: '',
    categoryId: '',
    images: null, // Berisi File object jika ada file baru
    notes: ''
})

const fetchProductAndDropdowns = async () => {
    try {
        const token = localStorage.getItem('token')
        const [catRes, unitRes, prodRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/units`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (catRes.data.status) categories.value = catRes.data.data
        if (unitRes.data.status) units.value = unitRes.data.data

        if (prodRes.data.status) {
            const p = prodRes.data.data
            form.value = {
                id: p.id,
                name: p.name,
                price: p.price,
                code: p.code || `PRD-${p.id.substring(0, 4)}`,
                unitId: p.unitId || '',
                categoryId: p.categoryId || '',
                images: null,
                notes: p.notes || ''
            }
            if (p.images) {
                // Formatting URL gambar dari backend
                existingImage.value = p.images.startsWith('http')
                    ? p.images
                    : `${import.meta.env.VITE_APP_API_URL}${p.images}`
            }
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal mengambil data produk.'
    }
}

onMounted(fetchProductAndDropdowns)

// Handler ketika file baru dipilih
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.images = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const handleSaveChanges = async () => {
    errorMessage.value = ''
    validationErrors.value = {}
    isSubmitting.value = true

    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()

        formData.append('name', form.value.name || '')
        formData.append('price', form.value.price ? Number(form.value.price) : '')
        formData.append('categoryId', form.value.categoryId || '')
        formData.append('unitId', form.value.unitId || '')
        if (form.value.notes) formData.append('notes', form.value.notes)
        if (form.value.images) formData.append('images', form.value.images)

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/products/${form.value.id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (res.data.status) {
            router.push('/products')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal mengubah data produk. Silakan periksa kembali data Anda.'
        validationErrors.value = err.response?.data?.errors || {}
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <!-- Header -->
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

            <!-- Alert Error Banner -->
            <div v-if="errorMessage"
                class="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200 flex items-center justify-between">
                <span>{{ errorMessage }}</span>
                <button @click="errorMessage = ''"
                    class="text-red-400 hover:text-red-600 font-bold ml-2">&times;</button>
            </div>

            <!-- Form Body -->
            <form @submit.prevent="handleSaveChanges" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseInput v-model="form.name" label="Product Name" placeholder="e.g. Signature Vanilla Latte"
                        :error="validationErrors.name?.[0]" required />

                    <BaseInput v-model="form.price" type="number" label="Unit Price ($)" placeholder="5.50"
                        :error="validationErrors.price?.[0]" required />

                    <BaseInput v-model="form.code" label="Product SKU (ReadOnly)" disabled />

                    <BaseSelect v-model="form.unitId" label="Measurement Unit" :options="units" valueKey="id"
                        labelKey="name" :error="validationErrors.unitId?.[0]" required />

                    <BaseSelect v-model="form.categoryId" label="Category" :options="categories" valueKey="id"
                        labelKey="name" :error="validationErrors.categoryId?.[0]" required />

                    <!-- Upload Image with Preview -->
                    <div class="space-y-2">
                        <BaseInput type="file" label="Product Image (Optional)" accept="image/*"
                            @change="handleFileChange" :error="validationErrors.images?.[0]" />

                        <!-- Image Preview Box -->
                        <div v-if="imagePreview || existingImage" class="mt-2 flex items-center gap-3">
                            <img :src="imagePreview || existingImage" alt="Product Preview"
                                class="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                            <span class="text-[10px] text-slate-400">
                                {{ imagePreview ? 'Pratinjau gambar baru' : 'Gambar produk saat ini' }}
                            </span>
                        </div>
                    </div>

                    <div class="sm:col-span-2 space-y-1">
                        <label class="block text-xs font-semibold text-slate-600">Description & Notes</label>
                        <textarea v-model="form.notes" rows="3"
                            placeholder="Ingredient notes, tasting notes, or recipe specs..."
                            :class="['w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition', validationErrors.notes ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-indigo-600']"></textarea>
                        <p v-if="validationErrors.notes?.[0]" class="text-[10px] text-red-500 font-medium">
                            {{ validationErrors.notes[0] }}
                        </p>
                    </div>
                </div>

                <!-- Footer Action Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <router-link to="/products"
                        class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl flex items-center">
                        Cancel
                    </router-link>
                    <BaseButton type="submit" :loading="isSubmitting" class="!w-auto px-6">
                        ✓ Save Changes
                    </BaseButton>
                </div>
            </form>
        </div>
    </div>
</template>
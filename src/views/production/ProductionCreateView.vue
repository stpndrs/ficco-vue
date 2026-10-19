<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const products = ref([])
const materials = ref([])
const units = ref([])
const isSubmitting = ref(false)

const form = ref({
    code: 'BATCH-2026-03',
    productionDate: new Date().toISOString().split('T')[0],
    productId: '',
    outputQty: 30,
    materialId: '',
    materialName: 'Ethiopian Yirgacheffe Raw Beans',
    materialQtyConsumed: 3,
    unit: 'cup',
    totalMaterialCost: 45.00,
    notes: ''
})

const fetchDropdowns = async () => {
    try {
        const token = localStorage.getItem('token')
        const [prodRes, matRes] = await Promise.all([
            axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/materials', { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (prodRes.data.status) {
            products.value = prodRes.data.data
            if (products.value.length) form.value.productId = products.value[0].id
        }
        if (matRes.data.status) {
            materials.value = matRes.data.data
            if (materials.value.length) {
                form.value.materialId = materials.value[0].id
                form.value.materialName = materials.value[0].name
            }
        }
        units.value = ['cup', 'pcs', 'portion', 'bag']
    } catch (err) {
        console.error('Failed to load dropdowns:', err)
    }
}

onMounted(fetchDropdowns)

const onMaterialSelect = () => {
    const selected = materials.value.find((m) => m.id === form.value.materialId)
    if (selected) {
        form.value.materialName = selected.name
    }
}

const handleSave = async () => {
    if (!form.value.productId || !form.value.materialId) {
        return alert('Target Produk dan Bahan Baku wajib dipilih!')
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            code: form.value.code,
            productionDate: form.value.productionDate,
            productId: form.value.productId,
            yieldQty: Number(form.value.outputQty),
            materialId: form.value.materialId,
            materialQtyConsumed: Number(form.value.materialQtyConsumed),
            unit: form.value.unit,
            materialCost: Number(form.value.totalMaterialCost),
            notes: form.value.notes
        }

        const res = await axios.post('http://localhost:5000/api/production', payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/production')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal menyimpan batch produksi')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Log Production Batch</h2>
                    <p class="text-xs text-slate-400 mt-0.5">
                        Record raw material consumption and automatically replenish finished goods inventory.
                    </p>
                </div>
                <router-link to="/production"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <!-- Form Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Batch Code (Auto-generated)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Production Date *</label>
                    <input v-model="form.productionDate" type="date"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Target Finished Product *</label>
                    <select v-model="form.productId"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Output Yield Qty *</label>
                    <input v-model="form.outputQty" type="number"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <!-- Consumed Material Specifications Box (FR-0224) -->
                <div class="sm:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <p class="text-xs font-bold text-slate-800">Consumed Material Specifications</p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Select Raw Material
                                *</label>
                            <select v-model="form.materialId" @change="onMaterialSelect"
                                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                                <option v-for="m in materials" :key="m.id" :value="m.id">
                                    {{ m.code || 'MAT-101' }} - {{ m.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Material Name
                                (Auto-filled)</label>
                            <input type="text" :value="form.materialName" disabled
                                class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Material Qty Consumed
                                *</label>
                            <input v-model="form.materialQtyConsumed" type="number"
                                class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
                        </div>

                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Unit *</label>
                            <select v-model="form.unit"
                                class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600">
                                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Total Material Cost ($)
                                *</label>
                            <input v-model="form.totalMaterialCost" type="number" step="0.01"
                                class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
                        </div>
                    </div>
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Production Notes / Shift QA</label>
                    <textarea v-model="form.notes" rows="3"
                        placeholder="Roasting profile, extraction time, barista shift notes..."
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/production"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSave" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save & Update Inventory
                </button>
            </div>
        </div>
    </div>
</template>
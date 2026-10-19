<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const form = ref({
    id: '',
    code: 'BATCH-2026-01',
    productionDate: '2026-10-10',
    productName: 'Signature Vanilla Latte',
    outputQty: 40,
    materialName: 'Ethiopian Yirgacheffe Raw Beans',
    materialQtyConsumed: 4,
    unit: 'cup',
    totalMaterialCost: 60.00,
    notes: 'Morning peak shift preparation batch.'
})

const fetchBatch = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/production/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const b = res.data.data
            form.value = {
                id: b.id,
                code: b.code || `BATCH-2026-${b.id.substring(0, 2)}`,
                productionDate: b.productionDate ? new Date(b.productionDate).toISOString().split('T')[0] : '2026-10-10',
                productName: b.product?.name || b.productName || 'Signature Vanilla Latte',
                outputQty: b.yieldQty || b.outputQty || 40,
                materialName: b.material?.name || b.materialName || 'Ethiopian Yirgacheffe Raw Beans',
                materialQtyConsumed: b.materialQtyConsumed || 4,
                unit: b.unit || 'cup',
                totalMaterialCost: b.materialCost || 60.00,
                notes: b.notes || 'Morning peak shift preparation batch.'
            }
        }
    } catch (err) {
        alert('Gagal mengambil data batch produksi')
    }
}

onMounted(fetchBatch)

const handleSaveChanges = async () => {
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            yieldQty: Number(form.value.outputQty),
            materialQtyConsumed: Number(form.value.materialQtyConsumed),
            materialCost: Number(form.value.totalMaterialCost),
            notes: form.value.notes
        }

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/production/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/production')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui batch produksi')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto text-left">
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Edit Production Batch: {{ form.code }}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">
                        Update batch parameters and synchronize inventory stock corrections.
                    </p>
                </div>
                <router-link to="/production"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Batch Code (ReadOnly)</label>
                    <input type="text" :value="form.code" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Production Date</label>
                    <input type="date" :value="form.productionDate" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Target Finished Product</label>
                    <input type="text" :value="form.productName" disabled
                        class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Output Yield Qty *</label>
                    <input v-model="form.outputQty" type="number"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <!-- Material Specifications Box -->
                <div class="sm:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <p class="text-xs font-bold text-slate-800">Material Specifications</p>

                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1">Material Name
                            (Auto-filled)</label>
                        <input type="text" :value="form.materialName" disabled
                            class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Material Qty Consumed
                                *</label>
                            <input v-model="form.materialQtyConsumed" type="number"
                                class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center outline-none focus:border-indigo-600" />
                        </div>

                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1">Unit</label>
                            <input type="text" :value="form.unit" disabled
                                class="w-full px-2.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-center font-bold text-slate-700" />
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
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Production Notes</label>
                    <textarea v-model="form.notes" rows="3"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"></textarea>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/production"
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
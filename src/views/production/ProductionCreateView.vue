<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const products = ref([])
const materials = ref([])
const units = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const form = ref({
    code: '',
    date: new Date().toISOString().split('T')[0],
    productId: '',
    qtyResult: 30,
    unitId: null,
    lines: [
        {
            materialId: '',
            qty: 1,
            unitId: null,
            description: ''
        }
    ],
    notes: ''
})

const fetchLastProductionCode = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/code/generate`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                type: "production"
            }
        })
        if (res.data.status) {
            form.value.code = res.data.data || null
        }
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
}

onMounted(async () => {
    await fetchLastProductionCode()
})

const fetchDropdowns = async () => {
    try {
        const token = localStorage.getItem('token')
        const [prodRes, matRes, unitRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/materials`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/units`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (prodRes.data.status) {
            products.value = prodRes.data.data
            if (products.value.length) form.value.productId = products.value[0].id
        }
        if (matRes.data.status) {
            materials.value = matRes.data.data
            if (materials.value.length) {
                form.value.lines[0].materialId = materials.value[0].id
                if (materials.value[0].unitId) {
                    form.value.lines[0].unitId = materials.value[0].unitId
                }
            }
        }
        if (unitRes.data.status) {
            units.value = unitRes.data.data
        }
    } catch (err) {
        errorMessage.value = 'Gagal memuat opsi data.'
    }
}

onMounted(fetchDropdowns)

const getMaterialDetail = (materialId) => {
    return materials.value.find(m => m.id === materialId) || null
}

// Otomatis pilih unitId bawaan dari material yang dipilih
const onMaterialChange = (line) => {
    const mat = getMaterialDetail(line.materialId)
    if (mat && mat.unitId) {
        line.unitId = mat.unitId
    }
}

const addMaterialLine = () => {
    const defaultMat = materials.value.length ? materials.value[0] : null
    form.value.lines.push({
        materialId: defaultMat ? defaultMat.id : '',
        qty: 1,
        unitId: defaultMat ? defaultMat.unitId : null,
        description: ''
    })
}

const removeMaterialLine = (index) => {
    if (form.value.lines.length > 1) {
        form.value.lines.splice(index, 1)
    }
}

const handleSave = async () => {
    errorMessage.value = ''
    validationErrors.value = {}

    if (!form.value.date) {
        errorMessage.value = 'Tanggal produksi wajib diisi!'
        return
    }

    if (Number(form.value.qtyResult) <= 0) {
        errorMessage.value = 'Hasil produksi (qtyResult) harus bernilai positif!'
        return
    }

    for (let i = 0; i < form.value.lines.length; i++) {
        const line = form.value.lines[i]
        const mat = getMaterialDetail(line.materialId)
        const qtyNum = Number(line.qty)

        if (!line.materialId) {
            errorMessage.value = `Bahan baku pada baris #${i + 1} belum dipilih!`
            return
        }

        if (qtyNum <= 0) {
            errorMessage.value = `Jumlah penggunaan pada baris #${i + 1} harus bernilai positif!`
            return
        }

        if (mat && qtyNum > mat.stock) {
            errorMessage.value = `Jumlah bahan baku "${mat.name}" (${qtyNum}) melebihi stok yang tersedia (${mat.stock})!`
            return
        }
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const payload = {
            code: form.value.code,
            date: form.value.date,
            productId: form.value.productId || null,
            qtyResult: Number(form.value.qtyResult),
            unitId: form.value.unitId || null,
            notes: form.value.notes || undefined,
            lines: form.value.lines.map(l => ({
                materialId: l.materialId,
                qty: Number(l.qty),
                unitId: l.unitId || null,
                description: l.description || undefined
            }))
        }

        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/production`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/production')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal menyimpan batch produksi'
        validationErrors.value = err.response?.data?.errors || {}
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-4xl mx-auto text-left">
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

            <!-- Alert Error Banner -->
            <div v-if="errorMessage"
                class="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200 flex items-center justify-between">
                <span>{{ errorMessage }}</span>
                <button @click="errorMessage = ''"
                    class="text-red-400 hover:text-red-600 font-bold ml-2">&times;</button>
            </div>

            <!-- Form Body -->
            <form @submit.prevent="handleSave" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseInput v-model="form.code" label="Batch Code (Auto-generated)" disabled />

                    <BaseInput v-model="form.date" type="date" label="Production Date"
                        :error="validationErrors.date?.[0]" required />

                    <BaseSelect v-model="form.productId" label="Target Finished Product" :options="products"
                        valueKey="id" labelKey="name" :error="validationErrors.productId?.[0]" required />

                    <div class="grid grid-cols-2 gap-2">
                        <BaseInput v-model="form.qtyResult" type="number" min="1" label="Quantity Result *"
                            :error="validationErrors.qtyResult?.[0]" required />
                        <BaseSelect v-model="form.unitId" label="Result Unit" :options="units" valueKey="id"
                            labelKey="name" placeholder="Pilih unit" />
                    </div>
                </div>

                <!-- Material Lines Section -->
                <div class="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xs font-bold text-slate-800">Consumed Material Lines</h3>
                            <p class="text-[10px] text-slate-400">Tambahkan bahan baku yang digunakan dalam batch ini
                            </p>
                        </div>
                        <button type="button" @click="addMaterialLine"
                            class="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition">
                            + Add Material
                        </button>
                    </div>

                    <div class="space-y-3">
                        <div v-for="(line, idx) in form.lines" :key="idx"
                            class="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-3 relative">
                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                                <div class="sm:col-span-4">
                                    <BaseSelect v-model="line.materialId" :label="`Raw Material #${idx + 1}`"
                                        :options="materials" valueKey="id" labelKey="name"
                                        @change="onMaterialChange(line)" required />
                                    <div v-if="getMaterialDetail(line.materialId)"
                                        class="text-[10px] text-slate-400 mt-1 space-y-0.5">
                                        <p>Kode: <span class="font-semibold text-slate-700">{{
                                            getMaterialDetail(line.materialId).code }}</span> | Tipe: <span
                                                class="font-semibold text-slate-700">{{
                                                    getMaterialDetail(line.materialId).type }}</span></p>
                                        <p>Stok Tersedia: <span class="font-bold text-slate-800">{{
                                            getMaterialDetail(line.materialId).stock }}</span></p>
                                    </div>
                                </div>

                                <div class="sm:col-span-2">
                                    <BaseInput v-model="line.qty" type="number" min="1" label="Quantity *"
                                        :error="getMaterialDetail(line.materialId) && line.qty > getMaterialDetail(line.materialId).stock ? `Maks ${getMaterialDetail(line.materialId).stock}` : null"
                                        required />
                                </div>

                                <div class="sm:col-span-2">
                                    <BaseSelect v-model="line.unitId" label="Unit" :options="units" valueKey="id"
                                        labelKey="name" placeholder="Unit" />
                                </div>

                                <div class="sm:col-span-3">
                                    <BaseInput v-model="line.description" label="Note / Desc"
                                        placeholder="Catatan bahan..." />
                                </div>

                                <div class="sm:col-span-1 flex justify-center pt-6">
                                    <button type="button" @click="removeMaterialLine(idx)"
                                        :disabled="form.lines.length === 1"
                                        class="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed font-bold">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block text-xs font-semibold text-gray-600">Production Notes / Shift QA</label>
                    <textarea v-model="form.notes" rows="3"
                        placeholder="Roasting profile, extraction time, barista shift notes..."
                        :class="['w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 text-gray-900 transition duration-200 outline-none focus:bg-white', validationErrors.notes ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100']"></textarea>
                    <span v-if="validationErrors.notes?.[0]" class="text-xs text-red-500 font-medium">
                        {{ validationErrors.notes[0] }}
                    </span>
                </div>

                <!-- Footer Action Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <router-link to="/production"
                        class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl flex items-center">
                        Cancel
                    </router-link>
                    <BaseButton type="submit" :loading="isSubmitting" class="!w-auto px-6">
                        ✓ Save & Update Inventory
                    </BaseButton>
                </div>
            </form>
        </div>
    </div>
</template>
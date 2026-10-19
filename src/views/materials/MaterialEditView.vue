<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const materialTypes = [
    { id: 'baku', name: 'Raw Material (Bahan Baku)' },
    { id: 'penolong', name: 'Auxiliary Material (Bahan Penolong)' }
]

const form = ref({
    id: '',
    code: '',
    name: '',
    type: 'baku',
    description: ''
})

const fetchMaterial = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/materials/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const m = res.data.data
            form.value = {
                id: m.id,
                code: m.code || `MAT-${m.id.substring(0, 3)}`,
                name: m.name,
                type: m.type || m.classification || 'baku',
                description: m.description || m.notes || ''
            }
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal mengambil data material'
    }
}

onMounted(fetchMaterial)

const handleSaveChanges = async () => {
    errorMessage.value = ''
    validationErrors.value = {}

    isSubmitting.value = true

    try {
        const token = localStorage.getItem('token')
        const payload = {
            name: form.value.name,
            type: form.value.type,
            description: form.value.description
        }

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/materials/${form.value.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            router.push('/materials')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal memperbarui material'
        validationErrors.value = err.response?.data?.errors || {}
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
                    <h2 class="text-lg font-bold text-slate-900">Edit Material: {{ form.code }}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Update classification, name, or material specifications.
                    </p>
                </div>
                <router-link to="/materials"
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
                    <BaseInput v-model="form.code" label="Material Code (ReadOnly)" disabled />

                    <BaseInput v-model="form.name" label="Material Name"
                        placeholder="e.g. Ethiopian Yirgacheffe Raw Beans" :error="validationErrors.name?.[0]"
                        required />

                    <div class="sm:col-span-2">
                        <BaseSelect v-model="form.type" label="Material Classification" :options="materialTypes"
                            valueKey="id" labelKey="name" :error="validationErrors.type?.[0]" required />
                    </div>

                    <div class="sm:col-span-2 space-y-1">
                        <label class="block text-xs font-semibold text-gray-600">Description & Quality Specs</label>
                        <textarea v-model="form.description" rows="3"
                            placeholder="Quality grade, origin, moisture content..."
                            :class="['w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 text-gray-900 transition duration-200 outline-none focus:bg-white', validationErrors.description ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100']"></textarea>
                        <span v-if="validationErrors.description?.[0]" class="text-xs text-red-500 font-medium">
                            {{ validationErrors.description[0] }}
                        </span>
                    </div>
                </div>

                <!-- Footer Action Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <router-link to="/materials"
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
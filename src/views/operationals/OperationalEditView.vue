<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const existingImage = ref('')
const imagePreview = ref('')

const form = ref({
    id: '',
    code: 'EXP-101',
    title: '',
    amount: '',
    date: '2026-10-05',
    paymentProof: null,
    notes: ''
})

const fetchExpense = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/operationals/${route.params.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            const e = res.data.data
            form.value = {
                id: e.id,
                code: e.code || `EXP-10${e.id}`,
                title: e.title,
                amount: e.amount,
                date: e.date ? new Date(e.date).toISOString().split('T')[0] : (e.transactionDate ? new Date(e.transactionDate).toISOString().split('T')[0] : '2026-10-05'),
                paymentProof: null,
                notes: e.notes || e.description || ''
            }

            if (e.paymentProof) {
                existingImage.value = e.paymentProof.startsWith('http')
                    ? e.paymentProof
                    : `${import.meta.env.VITE_APP_API_URL}${e.paymentProof}`
            }
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal mengambil data pengeluaran operasional'
    }
}

onMounted(fetchExpense)

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.paymentProof = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const handleSaveChanges = async () => {
    errorMessage.value = ''
    validationErrors.value = {}

    if (!form.value.title || !form.value.amount) {
        errorMessage.value = 'Judul pengeluaran dan jumlah (amount) wajib diisi!'
        return
    }

    if (Number(form.value.amount) <= 0) {
        errorMessage.value = 'Jumlah pengeluaran (amount) harus lebih besar dari 0!'
        return
    }

    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')
        const formData = new FormData()

        formData.append('title', form.value.title)
        formData.append('amount', Number(form.value.amount))
        formData.append('date', form.value.date)
        if (form.value.notes) formData.append('notes', form.value.notes)
        if (form.value.paymentProof) formData.append('paymentProof', form.value.paymentProof)

        const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/operationals/${form.value.id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (res.data.status) {
            router.push('/operationals')
        }
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal memperbarui pengeluaran operasional'
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
                    <div class="flex items-center gap-2">
                        <h2 class="text-lg font-bold text-slate-900">Edit Operating Expense: #{{ form.code }}</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">EDIT
                            RECORD</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">
                        Record recurring overhead costs such as rent, utility bills, employee wages, or software
                        subscriptions.
                    </p>
                </div>
                <router-link to="/operationals"
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

            <!-- Form Grid -->
            <form @submit.prevent="handleSaveChanges" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BaseInput v-model="form.code" label="Expense Code (ReadOnly)" disabled />

                    <BaseInput v-model="form.amount" type="number" step="0.01" label="Expense Amount ($)"
                        :error="validationErrors.amount?.[0]" required />

                    <BaseInput v-model="form.title" label="Expense Title" :error="validationErrors.title?.[0]"
                        required />

                    <!-- File Proof Input & Preview -->
                    <div class="space-y-2">
                        <BaseInput type="file" label="Payment Receipt / Proof (Optional)" accept="image/*"
                            @change="handleFileChange" :error="validationErrors.paymentProof?.[0]" />

                        <div v-if="imagePreview || existingImage" class="mt-2 flex items-center gap-3">
                            <img :src="imagePreview || existingImage" alt="Receipt Preview"
                                class="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                            <span class="text-[10px] text-slate-400">
                                {{ imagePreview ? 'Pratinjau berkas baru' : 'Berkas nota saat ini' }}
                            </span>
                        </div>
                    </div>

                    <BaseInput v-model="form.date" type="date" label="Transaction Date"
                        :error="validationErrors.date?.[0]" required />

                    <div class="space-y-1">
                        <label class="block text-xs font-semibold text-gray-600">Description & Memo</label>
                        <textarea v-model="form.notes" rows="3"
                            :class="['w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50/50 text-gray-900 transition duration-200 outline-none focus:bg-white', validationErrors.notes ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100']"></textarea>
                        <span v-if="validationErrors.notes?.[0]" class="text-xs text-red-500 font-medium">
                            {{ validationErrors.notes[0] }}
                        </span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <router-link to="/operationals"
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
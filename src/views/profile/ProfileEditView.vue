<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isSubmitting = ref(false)

const form = ref({
    id: '',
    umkmName: 'Artisan Coffee Roasters & Cafe',
    umkmAddress: '104 Pike Street, Suite 400, Seattle, WA 98101, United States',
    ownerName: 'Jordan Miles',
    ownerPhone: '+1 (206) 555-0192',
    email: 'jordan@artisancoffee.com',
    password: '',
    profileImageFile: null,
    profileImageUrlText: 'image.csnimakw'
})

const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token')
        const userId = localStorage.getItem('userId') || '1'
        const res = await axios.get(`http://localhost:5000/api/user/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            const d = res.data.data
            form.value.id = d.id || userId
            form.value.umkmName = d.umkmName || form.value.umkmName
            form.value.umkmAddress = d.umkmAddress || form.value.umkmAddress
            form.value.ownerName = d.ownerName || d.user?.name || form.value.ownerName
            form.value.ownerPhone = d.ownerPhone || d.user?.phone || form.value.ownerPhone
            form.value.email = d.email || d.user?.email || form.value.email
        }
    } catch (err) {
        console.error('Failed to load profile for edit:', err)
    }
}

onMounted(fetchProfile)

const handleFileChange = (e) => {
    if (e.target.files.length) {
        form.value.profileImageFile = e.target.files[0]
    }
}

const handleSaveChanges = async () => {
    isSubmitting.value = true
    try {
        const token = localStorage.getItem('token')

        // MENGGUNAKAN FORMDATA SESUAI INSTRUKSI
        const formData = new FormData()
        formData.append('id', form.value.id || localStorage.getItem('userId') || '1')
        formData.append('umkmName', form.value.umkmName)
        formData.append('umkmAddress', form.value.umkmAddress)
        formData.append('ownerName', form.value.ownerName)
        formData.append('ownerPhone', form.value.ownerPhone)
        formData.append('email', form.value.email)

        if (form.value.password) {
            formData.append('password', form.value.password)
        }

        if (form.value.profileImageFile) {
            formData.append('profileImage', form.value.profileImageFile)
        } else {
            formData.append('profileImageUrlText', form.value.profileImageUrlText)
        }

        const res = await axios.post('http://localhost:5000/api/user/profile/edit', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })

        if (res.data.status) {
            router.push('/profile')
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal memperbarui profil bisnis')
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
                    <div class="flex items-center gap-2">
                        <h2 class="text-lg font-bold text-slate-900">Update Business & Founder Profile</h2>
                        <span
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">EDIT
                            PROFILE</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">Update corporate entity information, primary headquarters,
                        or master credentials.</p>
                </div>
                <router-link to="/profile"
                    class="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold">
                    ← Back
                </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Registered Business Name *</label>
                    <input v-model="form.umkmName" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Founder Full Name *</label>
                    <input v-model="form.ownerName" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Headquarters & Store Address</label>
                    <input v-model="form.umkmAddress" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Founder Contact Phone</label>
                    <input v-model="form.ownerPhone" type="text"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Edit Photo Profile / File</label>
                    <input type="file" @change="handleFileChange"
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Corporate Workspace Email *</label>
                    <input v-model="form.email" type="email"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Update Password (Optional)</label>
                    <input v-model="form.password" type="password"
                        placeholder="Leave empty to maintain existing password"
                        class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600" />
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <router-link to="/profile"
                    class="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl">
                    Cancel
                </router-link>
                <button @click="handleSaveChanges" :disabled="isSubmitting"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition">
                    ✓ Save Profile Changes
                </button>
            </div>
        </div>
    </div>
</template>
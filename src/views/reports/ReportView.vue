<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { formatCurrency } from '@/helpers/formatCurrency'

// --- STATE MANAGEMENT ---
const activeTab = ref('income-statement') // 'income-statement' | 'inventory' | 'cash-flow' | 'balance-sheet'
const isLoading = ref(false)

// Filter Periode
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

// Toast State
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 3000)
}

// Data Laporan dari API
const reportMeta = ref({
    companyName: 'PT Tech Solusindo',
    periode: 'Oktober 2026'
})
const reportList = ref([])
const reportSummary = ref({})
const balanceSheetData = ref({ aset: [], liabilitas: [], ekuitas: [] })

const monthOptions = [
    { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maret' },
    { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' }, { id: 8, name: 'Agustus' }, { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'Desember' }
]

const yearOptions = [
    { id: 2025, name: '2025' },
    { id: 2026, name: '2026' },
    { id: 2027, name: '2027' }
]

// --- FETCH REPORT DATA ---
const fetchReport = async () => {
    isLoading.value = true
    reportList.value = []
    reportSummary.value = {}
    balanceSheetData.value = { aset: [], liabilitas: [], ekuitas: [] }

    try {
        const token = localStorage.getItem('token')
        const endpoint = `${import.meta.env.VITE_APP_API_URL}/api/reports/${activeTab.value}`
        
        const res = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                month: selectedMonth.value,
                year: selectedYear.value
            }
        })

        if (res.data.status) {
            const dataObj = res.data.data
            reportMeta.value = {
                companyName: dataObj.companyName || 'PT Tech Solusindo',
                periode: dataObj.periode || 'Oktober 2026'
            }
            reportSummary.value = dataObj.summary || {}

            if (activeTab.value === 'balance-sheet') {
                balanceSheetData.value = dataObj.data || { aset: [], liabilitas: [], ekuitas: [] }
            } else {
                reportList.value = dataObj.data || []
            }
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat laporan keuangan', 'error')
    } finally {
        isLoading.value = false
    }
}

// --- EXPORT DOWNLOAD HANDLER ---
const handleExport = async (type) => {
    try {
        const token = localStorage.getItem('token')
        const url = `${import.meta.env.VITE_APP_API_URL}/api/reports/${activeTab.value}/${type}`
        
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                month: selectedMonth.value,
                year: selectedYear.value
            },
            responseType: 'blob'
        })

        const blob = new Blob([res.data])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `Laporan_${activeTab.value}_${selectedMonth.value}_${selectedYear.value}.${type === 'excel' ? 'xlsx' : 'pdf'}`
        link.click()
        
        showToast(`Berhasil mengunduh laporan ${type.toUpperCase()}`)
    } catch (err) {
        showToast(`Gagal mengunduh file ${type.toUpperCase()}`, 'error')
    }
}

const switchTab = (tab) => {
    activeTab.value = tab
    fetchReport()
}

// Helper highlight row style berdasarkan kata kunci keterangan
const getRowClass = (keterangan, isHighlight = false) => {
    const ket = keterangan?.toLowerCase() || ''
    if (ket.includes('laba bersih') || ket.includes('saldo kas akhir') || ket.includes('harga pokok barang dijual') || ket.includes('harga pokok barang terjual')) {
        return 'bg-emerald-100/90 text-emerald-950 font-extrabold text-xs sm:text-sm'
    }
    if (ket.includes('total') || ket.includes('arus kas bersih')) {
        return 'bg-indigo-50/80 font-bold text-indigo-900'
    }
    return 'hover:bg-slate-50/50 transition'
}

onMounted(fetchReport)
</script>

<template>
    <div class="space-y-6 text-left relative px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <!-- Toast Notification -->
        <div v-if="toast.show" :class="[
            'fixed top-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 max-w-sm',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        ]">
            <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ toast.message }}</span>
        </div>

        <!-- Top Header & Navigation Tabs -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <!-- Tabs Bar -->
            <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button @click="switchTab('income-statement')" :class="[
                    'px-4 py-2 rounded-xl text-xs font-bold transition shrink-0',
                    activeTab === 'income-statement' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                ]">
                    📈 Laba Rugi
                </button>
                <button @click="switchTab('inventory')" :class="[
                    'px-4 py-2 rounded-xl text-xs font-bold transition shrink-0',
                    activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                ]">
                    📦 Persediaan
                </button>
                <button @click="switchTab('cash-flow')" :class="[
                    'px-4 py-2 rounded-xl text-xs font-bold transition shrink-0',
                    activeTab === 'cash-flow' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                ]">
                    💵 Arus Kas
                </button>
                <button @click="switchTab('balance-sheet')" :class="[
                    'px-4 py-2 rounded-xl text-xs font-bold transition shrink-0',
                    activeTab === 'balance-sheet' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                ]">
                    🏛️ Neraca
                </button>
            </div>

            <!-- Periode Filter & Export Action Buttons -->
            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                <div class="w-32">
                    <BaseSelect v-model="selectedMonth" :options="monthOptions" @change="fetchReport" />
                </div>
                <div class="w-28">
                    <BaseSelect v-model="selectedYear" :options="yearOptions" @change="fetchReport" />
                </div>

                <button @click="handleExport('pdf')" v-if="activeTab === 'income-statement'" 
                    class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0">
                    📄 Export PDF
                </button>

                <button @click="handleExport('excel')" 
                    class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0">
                    📊 Export Excel
                </button>
            </div>
        </div>

        <!-- REPORT DISPLAY CONTAINER -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
            <div v-if="isLoading" class="py-16 text-center text-slate-400 text-xs font-medium">
                Memuat data laporan keuangan...
            </div>

            <template v-else>
                <!-- Title Header Dinamis -->
                <div class="border-b border-slate-100 pb-4 mb-5">
                    <h2 class="text-base font-extrabold text-slate-900 uppercase">
                        {{ 
                            activeTab === 'income-statement' ? 'LAPORAN LABA RUGI' :
                            activeTab === 'inventory' ? 'LAPORAN PERSEDIAAN BARANG' :
                            activeTab === 'cash-flow' ? 'LAPORAN ARUS KAS' :
                            'LAPORAN POSISI KEUANGAN (NERACA)' 
                        }}
                    </h2>
                    <p class="text-xs text-slate-400 mt-0.5">
                        {{ reportMeta.companyName }} | Periode: {{ reportMeta.periode }}
                    </p>
                </div>

                <!-- 1. TAB TABLE STANDARD (Laba Rugi, Persediaan, Arus Kas) -->
                <div v-if="activeTab !== 'balance-sheet'" class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs min-w-[650px]">
                        <thead>
                            <tr class="bg-slate-800 text-white font-bold text-[11px] uppercase">
                                <th class="py-3 px-4 rounded-l-xl">Keterangan</th>
                                <th class="py-3 px-4">Jumlah (Rp)</th>
                                <th class="py-3 px-4">Jenis</th>
                                <th class="py-3 px-4 rounded-r-xl">Catatan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="(row, idx) in reportList" :key="idx" :class="getRowClass(row.keterangan)">
                                <td class="py-3 px-4 font-semibold">{{ row.keterangan }}</td>
                                <td class="py-3 px-4 font-extrabold" :class="row.jumlah < 0 ? 'text-red-600' : ''">
                                    {{ formatCurrency(row.jumlah) }}
                                </td>
                                <td class="py-3 px-4 text-slate-500">{{ row.jenis }}</td>
                                <td class="py-3 px-4 text-slate-500 font-normal">{{ row.catatan || '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 2. TAB TABLE NERACA / POSISI KEUANGAN -->
                <div v-else class="overflow-x-auto space-y-4">
                    <table class="w-full text-left border-collapse text-xs min-w-[650px]">
                        <thead>
                            <tr class="bg-slate-800 text-white font-bold text-[11px] uppercase">
                                <th class="py-3 px-4 rounded-l-xl">Keterangan</th>
                                <th class="py-3 px-4">Jumlah (Rp)</th>
                                <th class="py-3 px-4">Jenis</th>
                                <th class="py-3 px-4 rounded-r-xl">Catatan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <!-- ASET SECTION -->
                            <tr class="bg-slate-100 font-extrabold text-slate-900">
                                <td colspan="4" class="py-2.5 px-4 uppercase">ASET</td>
                            </tr>
                            <tr v-for="(row, idx) in balanceSheetData.aset" :key="'aset-' + idx" :class="getRowClass(row.keterangan)">
                                <td class="py-2.5 px-4 font-semibold pl-6">• {{ row.keterangan }}</td>
                                <td class="py-2.5 px-4 font-bold" :class="row.jumlah < 0 ? 'text-red-600' : ''">{{ formatCurrency(row.jumlah) }}</td>
                                <td class="py-2.5 px-4 text-slate-500">{{ row.jenis }}</td>
                                <td class="py-2.5 px-4 text-slate-500 font-normal">{{ row.catatan || '-' }}</td>
                            </tr>

                            <!-- LIABILITAS SECTION -->
                            <tr class="bg-slate-100 font-extrabold text-slate-900">
                                <td colspan="4" class="py-2.5 px-4 uppercase">LIABILITAS (UTANG)</td>
                            </tr>
                            <tr v-for="(row, idx) in balanceSheetData.liabilitas" :key="'liab-' + idx" :class="getRowClass(row.keterangan)">
                                <td class="py-2.5 px-4 font-semibold pl-6">• {{ row.keterangan }}</td>
                                <td class="py-2.5 px-4 font-bold" :class="row.jumlah < 0 ? 'text-red-600' : ''">{{ formatCurrency(row.jumlah) }}</td>
                                <td class="py-2.5 px-4 text-slate-500">{{ row.jenis }}</td>
                                <td class="py-2.5 px-4 text-slate-500 font-normal">{{ row.catatan || '-' }}</td>
                            </tr>

                            <!-- EKUITAS SECTION -->
                            <tr class="bg-slate-100 font-extrabold text-slate-900">
                                <td colspan="4" class="py-2.5 px-4 uppercase">EKUITAS (MODAL)</td>
                            </tr>
                            <tr v-for="(row, idx) in balanceSheetData.ekuitas" :key="'ekuitas-' + idx" :class="getRowClass(row.keterangan)">
                                <td class="py-2.5 px-4 font-semibold pl-6">• {{ row.keterangan }}</td>
                                <td class="py-2.5 px-4 font-bold" :class="row.jumlah < 0 ? 'text-red-600' : ''">{{ formatCurrency(row.jumlah) }}</td>
                                <td class="py-2.5 px-4 text-slate-500">{{ row.jenis }}</td>
                                <td class="py-2.5 px-4 text-slate-500 font-normal">{{ row.catatan || '-' }}</td>
                            </tr>

                            <!-- SUMMARY TOTAL LIABILITAS & EKUITAS -->
                            <tr class="bg-emerald-100/90 text-emerald-950 font-extrabold text-xs sm:text-sm">
                                <td class="py-3.5 px-4">TOTAL LIABILITAS DAN EKUITAS</td>
                                <td class="py-3.5 px-4">{{ formatCurrency(reportSummary.totalLiabilitasDanEkuitas || 0) }}</td>
                                <td class="py-3.5 px-4">Rumus</td>
                                <td class="py-3.5 px-4"></td>
                            </tr>

                            <!-- SELISIH ROW -->
                            <tr class="bg-amber-100/80 text-amber-950 font-extrabold text-xs sm:text-sm">
                                <td class="py-3.5 px-4 rounded-l-xl">SELISIH (HARUS NOL)</td>
                                <td class="py-3.5 px-4" :class="reportSummary.selisih !== 0 ? 'text-red-600' : ''">
                                    {{ formatCurrency(reportSummary.selisih || 0) }}
                                </td>
                                <td class="py-3.5 px-4">Rumus</td>
                                <td class="py-3.5 px-4 rounded-r-xl font-normal text-xs">
                                    {{ reportSummary.selisih !== 0 ? 'Periksa kembali input data transaksi' : 'Neraca seimbang' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </div>
    </div>
</template>
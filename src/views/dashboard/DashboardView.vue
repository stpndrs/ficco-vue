<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// --- STATE MANAGEMENT ---

// Dynamic Options State
const productList = ref([])
const materialList = ref([])

// 1. AI Finance Copilot (FR-0325 - FR-0332)
const chatInput = ref('')
const chatMessages = ref([
    {
        sender: 'ai',
        text: 'Halo! Saya AI Finance Copilot Anda. Berdasarkan analisa data riil 30 hari terakhir, margin operasional Anda berada di angka 20.2%. Ada yang ingin didiskusikan terkait omzet, cash burn, atau alokasi biaya?',
        citation: 'Tabel Sales, Operationals, dan PurchasingDetails',
        time: '10:14 AM'
    }
])

// 2. Smart Stock Forecasting (FR-0333 - FR-0345)
const forecastTab = ref('Products')
const categoryFilter = ref('')
const forecastData = ref([])

// 3. Cost & Margin Simulator (FR-0346 - FR-0352)
const selectedMaterialId = ref('')
const matIncrease = ref(15)
const priceAdjust = ref(5)
const simResult = ref({
    materialName: '-',
    scenarios: {
        current: { price: 0, cost: 0, marginPct: 0 },
        simulated: { price: 0, cost: 0, marginPct: 0 },
        conservative: { price: 0, cost: 0, marginPct: 0 }
    }
})

// 4. Production & Waste Analysis (FR-0353 - FR-0356)
const selectedMonth = ref('2026-10')
const wasteData = ref({
    overallEfficiencyPercentage: 0,
    materialsAnalysis: []
})

// 5. Product Trend & Basket Analysis (FR-0357 - FR-0360)
const basketData = ref({
    trendingChart: [],
    associationNetworkGraph: [],
    datatable: []
})

// --- API CALLS ---

// Dynamic Data Fetching (/products & /materials)
const fetchProductsAndMaterials = async () => {
    try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        const [prodRes, matRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products`, { headers }),
            axios.get(`${import.meta.env.VITE_APP_API_URL}/api/materials`, { headers })
        ])

        if (prodRes.data.status) productList.value = prodRes.data.data
        if (matRes.data.status) materialList.value = matRes.data.data
    } catch (err) {
        console.error('Failed to fetch products/materials list:', err)
    }
}

// FR-0326 - FR-0331: Copilot Submission
const sendCopilotMessage = async () => {
    if (!chatInput.value.trim()) return
    const userText = chatInput.value
    chatMessages.value.push({
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    chatInput.value = ''

    try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/dashboard/ai-copilot`,
            { question: userText },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.data.status) {
            chatMessages.value.push({
                sender: 'ai',
                text: res.data.data.answer,
                citation: res.data.data.dataSourceCitation,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        }
    } catch (err) {
        console.error('Copilot error:', err)
    }
}

// FR-0334 - FR-0340: Stock Forecasting API Call
const fetchForecasting = async () => {
    try {
        const token = localStorage.getItem('token')
        let url = `${import.meta.env.VITE_APP_API_URL}/api/dashboard/stock-forecasting?type=${forecastTab.value}`
        if (categoryFilter.value) url += `&categoryId=${categoryFilter.value}`

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.status) forecastData.value = res.data.data
    } catch (err) {
        console.error('Failed to load forecast:', err)
    }
}

// FR-0347 - FR-0352: Margin Simulator API Call
const runSimulator = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/dashboard/margin-simulator`, {
            materialId: selectedMaterialId.value || (materialList.value[0]?.id || ''),
            priceIncreasePercentage: Number(matIncrease.value),
            productPriceAdjustmentPercentage: Number(priceAdjust.value)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) simResult.value = res.data.data
    } catch (err) {
        console.error('Simulator error:', err)
    }
}

// FR-0354 - FR-0356: Waste Analysis API Call
const fetchWasteAnalysis = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/dashboard/waste-analysis?month=${selectedMonth.value}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) wasteData.value = res.data.data
    } catch (err) {
        console.error('Waste analysis error:', err)
    }
}

// FR-0357 - FR-0360: Product Trend & Basket Analysis API Call
const fetchProductTrends = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/dashboard/product-trends`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) basketData.value = res.data.data
    } catch (err) {
        console.error('Product trends error:', err)
    }
}

onMounted(async () => {
    await fetchProductsAndMaterials()
    fetchForecasting()
    runSimulator()
    fetchWasteAnalysis()
    fetchProductTrends()
})
</script>

<template>
    <div class="space-y-6 text-left relative text-slate-800">
        <!-- HEADER DASHBOARD -->
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Dashboard Intelligence</h1>
            <p class="text-xs text-slate-400 mt-0.5">Analisis performa riil, proyeksi persediaan, dan simulasi keputusan
                berbasis AI.</p>
        </div>

        <!-- ADVANCED AI ANALYTICAL GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- 1. AI FINANCE COPILOT CARD (FR-0325 - FR-0332) -->
            <div
                class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            ✨</div>
                        <div>
                            <h3 class="text-xs font-bold text-slate-900">AI Finance Copilot</h3>
                            <p class="text-[10px] text-slate-400">Conversational Financial Intelligence</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">●
                        Active</span>
                </div>

                <!-- Chat Bubble List (FR-0328) -->
                <div class="space-y-3 h-80 overflow-y-auto pr-2 text-xs">
                    <div v-for="(msg, idx) in chatMessages" :key="idx"
                        :class="[msg.sender === 'user' ? 'text-right' : 'text-left']">
                        <div
                            :class="['inline-block max-w-[90%] sm:max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2', msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none']">
                            <p class="leading-relaxed whitespace-pre-line">{{ msg.text }}</p>

                            <!-- Citation Label (FR-0332) -->
                            <div v-if="msg.citation"
                                class="pt-1.5 border-t border-slate-200/60 text-[9px] text-slate-400 italic">
                                📌 Sumber: {{ msg.citation }}
                            </div>
                        </div>
                        <p class="text-[9px] text-slate-400 mt-1 px-1">{{ msg.time }}</p>
                    </div>
                </div>

                <!-- Input Area (FR-0329 - FR-0331) -->
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                    <input v-model="chatInput" @keyup.enter="sendCopilotMessage" type="text"
                        placeholder="Tanyakan analisis keuangan..."
                        class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                    <button @click="sendCopilotMessage"
                        class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0">Submit</button>
                </div>
            </div>

            <!-- 2. SMART STOCK FORECASTING CARD (FR-0333 - FR-0345) -->
            <div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div
                    class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Smart Stock Forecasting</h3>
                        <p class="text-[10px] text-slate-400">Prediksi restock & proyeksi kebutuhan 30 hari</p>
                    </div>

                    <!-- Tab Filter (FR-0334 - FR-0337) -->
                    <div class="flex items-center gap-2">
                        <div class="flex p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
                            <button @click="forecastTab = 'Products'; fetchForecasting()"
                                :class="['px-3 py-1 rounded-lg transition', forecastTab === 'Products' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500']">Products</button>
                            <button @click="forecastTab = 'Materials'; fetchForecasting()"
                                :class="['px-3 py-1 rounded-lg transition', forecastTab === 'Materials' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500']">Materials</button>
                        </div>
                    </div>
                </div>

                <!-- Table Component (FR-0340 - FR-0345) -->
                <div class="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table class="w-full text-left border-collapse text-xs min-w-[500px]">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                <th class="py-2.5 px-3">NAME & CODE</th>
                                <th class="py-2.5 px-3">CURRENT STOCK</th>
                                <th class="py-2.5 px-3">AVG SALE FORECAST</th>
                                <th class="py-2.5 px-3">STOCK RECOMMENDATION</th>
                                <th class="py-2.5 px-3">STATUS ALERT</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="item in forecastData" :key="item.code" class="hover:bg-slate-50/50">
                                <td class="py-2.5 px-3">
                                    <p class="font-bold text-slate-800">{{ item.name }}</p>
                                    <p class="text-[9px] text-indigo-600 font-mono">{{ item.code }}</p>
                                </td>
                                <td class="py-2.5 px-3 font-extrabold text-slate-900">{{ item.currentStock }}</td>
                                <td class="py-2.5 px-3 text-slate-600 font-medium">{{ item.averageSaleForecast }}/hari
                                </td>
                                <td class="py-2.5 px-3 font-bold text-indigo-600">{{ item.stockRecommendation }} unit
                                </td>
                                <td class="py-2.5 px-3">
                                    <span
                                        :class="['px-2 py-0.5 rounded-md text-[10px] font-bold', item.alert === 'Immediate Restock' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600']">
                                        {{ item.alert }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. COST & MARGIN SIMULATOR CARD (FR-0346 - FR-0352) -->
            <div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Cost & Margin Simulator</h3>
                        <p class="text-[10px] text-slate-400">Pengujian skenario what-if kenaikan HPP & penyesuaian
                            harga</p>
                    </div>
                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold">Simulator
                        Engine</span>
                </div>

                <!-- Input Controls (FR-0347, FR-0348, FR-0350) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">BAHAN BAKU
                            (FR-0347)</label>
                        <select v-model="selectedMaterialId" @change="runSimulator"
                            class="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600">
                            <option value="">Pilih Bahan Baku...</option>
                            <option value="mat-1">Bawang Merah</option>
                            <option value="mat-2">Biji Kopi Arabika</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kenaikan Harga Bahan
                            (%)</label>
                        <input v-model="matIncrease" @input="runSimulator" type="number"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rencana Harga Jual
                            (%)</label>
                        <input v-model="priceAdjust" @input="runSimulator" type="number"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600" />
                    </div>
                </div>

                <!-- Comparison Card (FR-0349) & Interactive Skenario Bar (FR-0351) -->
                <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Perbandingan 3 Skenario Keputusan
                        (FR-0351)</p>

                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="p-2 bg-white rounded-xl border border-slate-200/60">
                            <p class="text-[9px] font-bold text-slate-400">SAAT INI</p>
                            <p class="text-base font-extrabold text-slate-900 mt-0.5">{{
                                simResult.scenarios.current.marginPct }}%</p>
                        </div>
                        <div class="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <p class="text-[9px] font-bold text-indigo-600">SIMULASI (+{{ priceAdjust }}%)</p>
                            <p class="text-base font-extrabold text-indigo-700 mt-0.5">{{
                                simResult.scenarios.simulated.marginPct }}%</p>
                        </div>
                        <div class="p-2 bg-amber-50 border border-amber-100 rounded-xl">
                            <p class="text-[9px] font-bold text-amber-700">KONSERVATIF (0%)</p>
                            <p class="text-base font-extrabold text-amber-800 mt-0.5">{{
                                simResult.scenarios.conservative.marginPct }}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. PRODUCTION & WASTE ANALYSIS CARD (FR-0353 - FR-0356) -->
            <div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Production & Waste Analysis</h3>
                        <p class="text-[10px] text-slate-400">Deteksi anomali kebocoran dan efisiensi bahan baku</p>
                    </div>

                    <!-- Month Filter (FR-0354) -->
                    <input v-model="selectedMonth" @change="fetchWasteAnalysis" type="month"
                        class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                </div>

                <!-- Gauge Chart Presentation (FR-0356) -->
                <div
                    class="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-emerald-800 uppercase">RATA-RATA EFISIENSI BAHAN (GAUGE)
                        </p>
                        <p class="text-xs text-emerald-600">Penggunaan bahan baku tergolong efisien</p>
                    </div>
                    <span class="text-xl font-black text-emerald-700">{{ wasteData.overallEfficiencyPercentage
                    }}%</span>
                </div>

                <!-- Datatable Component (FR-0355) -->
                <div class="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                <th class="py-2.5 px-3">MATERIAL CODE & NAME</th>
                                <th class="py-2.5 px-3">STOCK</th>
                                <th class="py-2.5 px-3">STATUS BADGE</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="mat in wasteData.materialsAnalysis" :key="mat.code" class="hover:bg-slate-50/50">
                                <td class="py-2.5 px-3">
                                    <p class="font-bold text-slate-800">{{ mat.name }}</p>
                                    <p class="text-[9px] text-indigo-600 font-mono">{{ mat.code }}</p>
                                </td>
                                <td class="py-2.5 px-3 font-extrabold text-slate-900">{{ mat.stock }}</td>
                                <td class="py-2.5 px-3">
                                    <span
                                        :class="['px-2.5 py-1 rounded-full text-[10px] font-bold',
                                            mat.statusBadge === 'Efisien' ? 'bg-emerald-50 text-emerald-600' :
                                                mat.statusBadge === 'Normal' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600']">
                                        {{ mat.statusBadge }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- 5. PRODUCT TREND & BASKET ANALYSIS CARD (FR-0357 - FR-0360) -->
        <div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                    <h3 class="text-xs font-bold text-slate-900">Product Trend & Basket Analysis</h3>
                    <p class="text-[10px] text-slate-400">Analisa pola bundling, korelasi produk, dan pergerakan tren
                    </p>
                </div>
            </div>

            <!-- Association Network Graph Banner (FR-0359) -->
            <div
                class="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row justify-between gap-2 text-xs">
                <div>
                    <p class="font-bold text-slate-900">Association Network Pairing (Model M5):</p>
                    <p class="text-[10px] text-slate-500">Kombinasi produk yang paling sering dibeli secara bersamaan
                        dalam transaksi POS.</p>
                </div>
                <div class="flex gap-2 items-center">
                    <span v-for="net in basketData.associationNetworkGraph" :key="net.source"
                        class="px-2.5 py-1 bg-white border border-indigo-100 rounded-xl text-[10px] font-bold text-indigo-700">
                        {{ net.source }} 🔗 {{ net.target }} ({{ Math.round(net.confidenceScore * 100) }}%)
                    </span>
                </div>
            </div>

            <!-- Datatable Component (FR-0360) -->
            <div class="overflow-x-auto border border-slate-100 rounded-2xl">
                <table class="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                        <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                            <th class="py-3 px-4">PRODUCT NAME</th>
                            <th class="py-3 px-4">PRODUCT CODE</th>
                            <th class="py-3 px-4">STOCK</th>
                            <th class="py-3 px-4">BADGE INDICATOR</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="row in basketData.datatable" :key="row.id" class="hover:bg-slate-50/50">
                            <td class="py-3 px-4 font-bold text-slate-800">{{ row.name }}</td>
                            <td class="py-3 px-4 font-mono text-indigo-600">{{ row.code }}</td>
                            <td class="py-3 px-4 font-extrabold text-slate-900">{{ row.stock }}</td>
                            <td class="py-3 px-4">
                                <span
                                    :class="['px-2.5 py-1 rounded-full font-bold text-[10px]',
                                        row.badgeIndicator === 'Hot Item' ? 'bg-red-50 text-red-600' :
                                            row.badgeIndicator === 'Fast Moving' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600']">
                                    {{ row.badgeIndicator }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// --- STATE MANAGEMENT ---
const forecastTab = ref('Products')
const chatInput = ref('')
const chatMessages = ref([
    {
        sender: 'ai',
        text: 'Hello Jordan Miles! I have synthesized your financial performance for Artisan Coffee Roasters & Cafe. Operating margins are holding at 20.2%, but green coffee bean wholesale prices are projected to rise by +8.4% next month. How can I assist with your cash flow or cost allocation today?',
        tags: ['#Margin Audit', '#Commodity Alert'],
        time: '10:14 AM'
    }
])

const forecastData = ref([])
const wasteData = ref({ efficiencyPercentage: 94.2, batches: [] })
const basketData = ref([])

// Simulator State
const matIncrease = ref(15)
const priceAdjust = ref(5)
const simResult = ref({ currentMargin: 20.2, simulatedMargin: 18.7, simulatedNetProfit: 27830.70 })

// --- API CALLS ---
const fetchForecasting = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:5000/api/dashboard/stock-forecasting?type=${forecastTab.value}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) forecastData.value = res.data.data
    } catch (err) {
        console.error('Failed to load forecast:', err)
    }
}

const sendCopilotMessage = async () => {
    if (!chatInput.value.trim()) return
    const userText = chatInput.value
    chatMessages.value.push({ sender: 'user', text: userText, time: '10:16 AM' })
    chatInput.value = ''

    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://localhost:5000/api/dashboard/ai-copilot', { question: userText }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) {
            chatMessages.value.push({
                sender: 'ai',
                text: res.data.data.reply,
                tags: res.data.data.citations,
                time: res.data.data.timestamp
            })
        }
    } catch (err) {
        console.error('Copilot error:', err)
    }
}

const runSimulator = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://localhost:5000/api/dashboard/margin-simulator', {
            materialIncreasePct: Number(matIncrease.value),
            priceAdjustmentPct: Number(priceAdjust.value)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.status) simResult.value = res.data.data
    } catch (err) {
        console.error('Simulator error:', err)
    }
}

const fetchDashboardData = async () => {
    try {
        const token = localStorage.getItem('token')
        const [wasteRes, basketRes] = await Promise.all([
            axios.get('http://localhost:5000/api/dashboard/waste-analysis', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/dashboard/product-trends', { headers: { Authorization: `Bearer ${token}` } })
        ])
        if (wasteRes.data.status) wasteData.value = wasteRes.data.data
        if (basketRes.data.status) basketData.value = basketRes.data.data.affinities
    } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err)
    }
}

onMounted(() => {
    fetchForecasting()
    fetchDashboardData()
})
</script>

<template>
    <div class="space-y-6 text-left relative text-slate-800">
        <!-- EXECUTIVE SUMMARY CARD (FR-0325) -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div>
                <h1 class="text-xl font-bold text-slate-900">Executive Summary</h1>
                <p class="text-xs text-slate-400 mt-0.5">Real-Time financial performance, AI intelligence synthesis, and
                    operational forecast for Artisan Coffee Roasters & Cafe.</p>
            </div>

            <!-- Financial Statistics (KPIs) Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-400 uppercase">TOTAL REVENUE</span>
                        <span
                            class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px]">+15.8%
                            vs Last Month</span>
                    </div>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">$142,500.00</p>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-400 uppercase">NET OPERATING PROFIT</span>
                        <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[10px]">20.2%
                            Net Margin</span>
                    </div>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">$28,780.00</p>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-400 uppercase">NET CASH FLOW</span>
                        <span
                            class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px]">+8.2%
                            Inflow Surplus</span>
                    </div>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">$19,340.00</p>
                </div>
            </div>

            <!-- Executive AI Summary Banners -->
            <div class="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <div
                    class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    ✨</div>
                <div class="text-xs space-y-1">
                    <p class="font-bold text-slate-900 uppercase">EXECUTIVE AI PERFORMANCE SUMMARY</p>
                    <p class="text-slate-600 leading-relaxed">Monthly gross revenue expanded by <span
                            class="font-bold text-slate-800">+15.8% ($142,500.00)</span> driven by higher afternoon
                        specialty beverage sales and retail whole-bean packages. Operating margin remains healthy at
                        <span class="font-bold text-slate-800">20.2% ($28,780.00 net profit)</span> despite an 8.4% rise
                        in wholesale raw milk costs.</p>
                </div>
            </div>
        </div>

        <!-- ADVANCED AI ANALYTICAL GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 1. AI FINANCE COPILOT CARD (FR-0325 - FR-0332) -->
            <div
                class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
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
                        <div :class="[
                            'inline-block max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2',
                            msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none'
                        ]">
                            <p class="leading-relaxed">{{ msg.text }}</p>
                            <div v-if="msg.tags" class="flex flex-wrap gap-1 pt-1">
                                <span v-for="tag in msg.tags" :key="tag"
                                    class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-bold">{{
                                    tag }}</span>
                            </div>
                        </div>
                        <p class="text-[9px] text-slate-400 mt-1 px-1">{{ msg.time }}</p>
                    </div>
                </div>

                <!-- Input Area (FR-0329 & FR-0331) -->
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                    <input v-model="chatInput" @keyup.enter="sendCopilotMessage" type="text"
                        placeholder="Ask Copilot: 'What if green coffee increases +15%?'..."
                        class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition" />
                    <button @click="sendCopilotMessage"
                        class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                        Submit
                    </button>
                </div>
            </div>

            <!-- 2. SMART STOCK FORECASTING CARD (FR-0333 - FR-0345) -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Smart Stock Forecasting</h3>
                        <p class="text-[10px] text-slate-400">Predictive safety stock & 30-day runout model</p>
                    </div>
                    <!-- Tab Filter (FR-0334 - FR-0336) -->
                    <div class="flex p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
                        <button @click="forecastTab = 'Products'; fetchForecasting()"
                            :class="['px-3 py-1 rounded-lg transition', forecastTab === 'Products' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500']">Products</button>
                        <button @click="forecastTab = 'Materials'; fetchForecasting()"
                            :class="['px-3 py-1 rounded-lg transition', forecastTab === 'Materials' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500']">Materials</button>
                    </div>
                </div>

                <!-- Table Component (FR-0340) -->
                <div class="overflow-hidden border border-slate-100 rounded-2xl">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                <th class="py-2.5 px-3">NAME & CODE</th>
                                <th class="py-2.5 px-3">CATEGORY</th>
                                <th class="py-2.5 px-3">STOCK</th>
                                <th class="py-2.5 px-3">RECOMMEND</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="item in forecastData" :key="item.id" class="hover:bg-slate-50/50">
                                <td class="py-2.5 px-3">
                                    <p class="font-bold text-slate-800">{{ item.name }}</p>
                                    <p class="text-[9px] text-indigo-600 font-mono">{{ item.code }}</p>
                                </td>
                                <td class="py-2.5 px-3 text-slate-500">{{ item.category }}</td>
                                <td class="py-2.5 px-3 font-extrabold text-slate-900">{{ item.currentStock }}</td>
                                <td class="py-2.5 px-3"><span
                                        class="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-bold rounded-md text-[10px]">{{
                                        item.recommendation }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. COST & MARGIN SIMULATOR CARD (FR-0346 - FR-0352) -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Cost & Margin Simulator</h3>
                        <p class="text-[10px] text-slate-400">Interactive what-if decision scenario engine</p>
                    </div>
                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold">Live
                        Calculator</span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Material Price Increase
                            (%)</label>
                        <input v-model="matIncrease" @input="runSimulator" type="number"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Price
                            Adjustment (%)</label>
                        <input v-model="priceAdjust" @input="runSimulator" type="number"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-600" />
                    </div>
                </div>

                <!-- Comparison Cards (FR-0349) -->
                <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[9px] font-bold text-slate-400 uppercase">CURRENT MARGIN</p>
                        <p class="text-xl font-extrabold text-slate-900 mt-0.5">{{ simResult.currentMargin }}%</p>
                    </div>
                    <div>
                        <p class="text-[9px] font-bold text-slate-400 uppercase">SIMULATED MARGIN</p>
                        <p class="text-xl font-extrabold text-indigo-600 mt-0.5">{{ simResult.simulatedMargin }}%</p>
                    </div>
                </div>
            </div>

            <!-- 4. PRODUCTION & WASTE ANALYSIS CARD (FR-0353 - FR-0356) -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="text-xs font-bold text-slate-900">Production & Waste Analysis</h3>
                        <p class="text-[10px] text-slate-400">Material efficiency & scrap diagnostics</p>
                    </div>
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px]">94.2%
                        Efficiency</span>
                </div>

                <div class="space-y-2">
                    <div v-for="b in wasteData.batches" :key="b.batchCode"
                        class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                            <p class="font-bold text-slate-800">{{ b.line }}</p>
                            <p class="text-[9px] text-indigo-600 font-mono">{{ b.batchCode }} · {{ b.inputQty }}</p>
                        </div>
                        <span
                            :class="['px-2 py-0.5 rounded-md font-bold text-[10px]', b.status === 'Optimal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600']">{{
                            b.status }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 5. PRODUCT TREND & BASKET ANALYSIS CARD (FR-0357 - FR-0360) -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                    <h3 class="text-xs font-bold text-slate-900">Product Trend & Basket Analysis</h3>
                    <p class="text-[10px] text-slate-400">Cross-sell pairing affinity & basket lift analysis</p>
                </div>
            </div>

            <div class="overflow-hidden border border-slate-100 rounded-2xl">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                            <th class="py-3 px-4">PRIMARY ITEM</th>
                            <th class="py-3 px-4">CO-PURCHASED WITH</th>
                            <th class="py-3 px-4">AFFINITY</th>
                            <th class="py-3 px-4">BASKET LIFT</th>
                            <th class="py-3 px-4">STRATEGY BADGE</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="row in basketData" :key="row.primaryItem" class="hover:bg-slate-50/50">
                            <td class="py-3 px-4 font-bold text-slate-800">{{ row.primaryItem }}</td>
                            <td class="py-3 px-4 text-slate-600">{{ row.coPurchasedWith }}</td>
                            <td class="py-3 px-4 font-extrabold text-indigo-600">{{ row.affinityPct }}%</td>
                            <td class="py-3 px-4 font-bold text-emerald-600">{{ row.basketLift }}</td>
                            <td class="py-3 px-4">
                                <span
                                    class="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[10px] border border-slate-200">{{
                                    row.strategyBadge }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
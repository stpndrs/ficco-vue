<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(true)
const userProfile = ref({
    name: 'Jordan Miles',
    role: 'Administrator',
    umkmName: 'Finance Copilot Workspace',
})

const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data.status) {
            userProfile.value = {
                name: res.data.data.user.name || res.data.data.user.username,
                role: res.data.data.user.role,
                umkmName: res.data.data.profile.umkmName || 'Finance Copilot Workspace',
            }
        }
    } catch (err) {
        console.error('Failed to load user profile:', err)
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
}

onMounted(() => {
    fetchProfile()
})

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Sales', path: '/sales', icon: 'sales' },
    { name: 'Products', path: '/products', icon: 'products' },
    { name: 'Inventory', path: '/inventory', icon: 'inventory' },
    { name: 'Purchasing', path: '/purchasing', icon: 'purchasing' },
    { name: 'Materials', path: '/materials', icon: 'materials' },
    { name: 'Production', path: '/production', icon: 'production' },
    { name: 'Operationals', path: '/operationals', icon: 'operationals' },
    { name: 'Reports', path: '/reports', icon: 'reports' },
    { name: 'Users', path: '/users', icon: 'users' },
]
</script>

<template>
    <div class="min-h-screen bg-slate-50/60 flex font-sans text-slate-800">
        <!-- Sidebar Navigation -->
        <aside :class="[
            'bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-30 fixed lg:static inset-y-0 left-0',
            isSidebarOpen ? 'w-64' : 'w-20'
        ]">
            <div>
                <!-- Brand Header -->
                <div class="h-20 flex items-center justify-between px-6">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div
                            class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span v-if="isSidebarOpen" class="font-bold text-base tracking-tight text-slate-900 truncate">
                            Finance <span class="text-indigo-600">Copilot</span>
                        </span>
                    </div>

                    <button @click="isSidebarOpen = !isSidebarOpen"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition hidden lg:block">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <!-- Menu Title -->
                <div v-if="isSidebarOpen"
                    class="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase text-left">
                    Navigation
                </div>

                <!-- Nav Items -->
                <nav class="px-3 space-y-1">
                    <router-link v-for="item in menuItems" :key="item.path" :to="item.path" :class="[
                        'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150',
                        route.path.startsWith(item.path)
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                    ]">
                        <!-- SVG Icon Badge -->
                        <div class="w-5 h-5 shrink-0 flex items-center justify-center">
                            <svg v-if="item.icon === 'sales'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>

                        <span v-if="isSidebarOpen" class="truncate text-left">{{ item.name }}</span>
                    </router-link>
                </nav>
            </div>

            <!-- Bottom Copilot Badge -->
            <div p-4 class="p-4">
                <div v-if="isSidebarOpen"
                    class="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-left shadow-lg shadow-indigo-200">
                    <p class="text-xs font-bold flex items-center gap-1.5">
                        <span>✨</span> Copilot Pro
                    </p>
                    <p class="text-[10px] text-indigo-100 mt-0.5">Autonomous Financial Intelligence</p>
                </div>
            </div>
        </aside>

        <!-- Main Right Content Area -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Topbar Header -->
            <header
                class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
                <div class="flex items-center gap-4">
                    <h1 class="text-xl font-bold text-slate-900 tracking-tight">Sales</h1>
                </div>

                <div class="flex items-center gap-5">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-100">
                            JM
                        </div>
                        <div class="hidden sm:block text-left">
                            <p class="text-xs font-bold text-slate-900 leading-tight">{{ userProfile.name }}</p>
                            <p class="text-[10px] font-medium text-slate-400">{{ userProfile.role }}</p>
                        </div>
                    </div>

                    <button @click="handleLogout"
                        class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition pl-3 border-l border-slate-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            <!-- Router Content Slot -->
            <main class="flex-1 overflow-y-auto p-8">
                <router-view />
            </main>

            <!-- Footer -->
            <footer
                class="py-4 px-8 border-t border-slate-200/60 bg-white/50 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p>© 2026 Finance Copilot. All rights reserved.</p>
                <div class="flex items-center gap-4">
                    <a href="#" class="hover:text-slate-600">Privacy Policy</a>
                    <a href="#" class="hover:text-slate-600">Terms of Service</a>
                    <a href="#" class="hover:text-slate-600">Help & Documentation</a>
                </div>
            </footer>
        </div>
    </div>
</template>
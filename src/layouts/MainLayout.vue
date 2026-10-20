<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(window.innerWidth >= 1024)
const isMobileOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const dropdownRef = ref(null)

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
    isProfileDropdownOpen.value = false
    localStorage.removeItem('token')
    router.push('/login')
}

const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
        isMobileOpen.value = !isMobileOpen.value
    } else {
        isSidebarOpen.value = !isSidebarOpen.value
    }
}

const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
        isMobileOpen.value = false
    }
}

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isProfileDropdownOpen.value = false
    }
}

onMounted(() => {
    fetchProfile()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
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
    <div class="min-h-screen bg-slate-50/60 flex font-sans text-slate-800 relative">
        <!-- Backdrop Mobile Overlay -->
        <div v-if="isMobileOpen" @click="isMobileOpen = false"
            class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"></div>

        <!-- Sidebar Navigation -->
        <aside :class="[
            'bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-30 fixed lg:static inset-y-0 left-0 h-full',
            isSidebarOpen ? 'lg:w-64' : 'lg:w-20',
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
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
                        <span v-if="isSidebarOpen || isMobileOpen"
                            class="font-bold text-base tracking-tight text-slate-900 truncate">
                            Finance <span class="text-indigo-600">Copilot</span>
                        </span>
                    </div>

                    <button @click="toggleSidebar"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition hidden lg:block">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <button @click="isMobileOpen = false"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition lg:hidden">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Menu Title -->
                <div v-if="isSidebarOpen || isMobileOpen"
                    class="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase text-left">
                    Navigation
                </div>

                <!-- Nav Items -->
                <nav class="px-3 space-y-1">
                    <router-link v-for="item in menuItems" :key="item.path" :to="item.path" @click="closeMobileSidebar"
                        :class="[
                            'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150',
                            route.path.startsWith(item.path)
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                        ]">
                        <div class="w-5 h-5 shrink-0 flex items-center justify-center">
                            <svg v-if="item.icon === 'dashboard'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <svg v-else-if="item.icon === 'sales'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <svg v-else-if="item.icon === 'products'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <svg v-else-if="item.icon === 'inventory'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <svg v-else-if="item.icon === 'purchasing'" class="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <svg v-else-if="item.icon === 'materials'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <svg v-else-if="item.icon === 'production'" class="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <svg v-else-if="item.icon === 'operationals'" class="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <svg v-else-if="item.icon === 'reports'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <svg v-else-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <span v-if="isSidebarOpen || isMobileOpen" class="truncate text-left">{{ item.name }}</span>
                    </router-link>
                </nav>
            </div>

            <!-- Bottom Copilot Badge -->
            <div class="p-4">
                <div v-if="isSidebarOpen || isMobileOpen"
                    class="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-left shadow-lg shadow-indigo-200">
                    <p class="text-xs font-bold flex items-center gap-1.5">
                        <span>✨</span> Copilot Pro
                    </p>
                    <p class="text-[10px] text-indigo-100 mt-0.5">Autonomous Financial Intelligence</p>
                </div>
            </div>
        </aside>

        <!-- Main Right Content Area -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Topbar Header (Gunakan z-10 agar modal z-50 menutupi penuh tanpa menyisakan celah) -->
            <header
                class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">
                <div class="flex items-center gap-3">
                    <button @click="isMobileOpen = true"
                        class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight capitalize">
                        {{ route.name || route.path.replace('/', '') }}
                    </h1>
                </div>

                <!-- Profile Dropdown Container -->
                <div class="relative" ref="dropdownRef">
                    <button @click="isProfileDropdownOpen = !isProfileDropdownOpen"
                        class="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100/70 transition duration-150 outline-none focus:ring-2 focus:ring-indigo-100">
                        <div
                            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 shrink-0">
                            {{ userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'J' }}
                        </div>
                        <div class="hidden sm:block text-left">
                            <p class="text-xs font-bold text-slate-900 leading-tight">{{ userProfile.name }}</p>
                            <p class="text-[10px] font-medium text-slate-400">{{ userProfile.role }}</p>
                        </div>
                        <svg class="w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200"
                            :class="{ 'rotate-180': isProfileDropdownOpen }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="isProfileDropdownOpen"
                        class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 text-left animate-in fade-in zoom-in-95 duration-100">
                        <div class="px-4 py-2.5 border-b border-slate-100">
                            <p class="text-xs font-bold text-slate-900 truncate">{{ userProfile.name }}</p>
                            <p class="text-[10px] font-medium text-slate-400 truncate">{{ userProfile.umkmName }}</p>
                        </div>

                        <div class="py-1">
                            <router-link to="/profile" @click="isProfileDropdownOpen = false"
                                class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile Settings
                            </router-link>
                        </div>

                        <div class="pt-1 border-t border-slate-100">
                            <button @click="handleLogout"
                                class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Router Content Slot -->
            <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <router-view />
            </main>

            <!-- Footer -->
            <footer
                class="py-4 px-4 sm:px-8 border-t border-slate-200/60 bg-white/50 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p>© 2026 Finance Copilot. All rights reserved.</p>
                <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
                    <a href="#" class="hover:text-slate-600">Privacy Policy</a>
                    <a href="#" class="hover:text-slate-600">Terms of Service</a>
                    <a href="#" class="hover:text-slate-600">Help & Documentation</a>
                </div>
            </footer>
        </div>
    </div>
</template>
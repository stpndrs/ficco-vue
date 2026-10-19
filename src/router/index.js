import MainLayout from '@/layouts/MainLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			redirect: '/login'
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/auth/LoginView.vue'),
			meta: { requiresGuest: true }
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('../views/auth/RegisterView.vue'),
			meta: { requiresGuest: true }
		},
		{
			path: '/forgot-password',
			name: 'forgot-password',
			component: () => import('../views/auth/ForgotPasswordView.vue'),
			meta: { requiresGuest: true }
		},
		{
			path: '/reset-password',
			name: 'reset-password',
			component: () => import('../views/auth/ResetPasswordView.vue'),
			meta: { requiresGuest: true }
		},
		{
			path: '/',
			component: MainLayout,
			meta: { requiresAuth: true },
			children: [
				{
					path: '',
					redirect: '/dashboard'
				},
				{
					path: 'dashboard',
					name: 'dashboard',
					component: () => import('../views/dashboard/DashboardView.vue')
				},
				// --- 3 HALAMAN MODUL SALES ---
				{
					path: 'sales',
					name: 'sales-create',
					component: () => import('../views/sales/SalesCreateView.vue')
				},
				{
					path: 'sales/history',
					name: 'sales-history',
					component: () => import('../views/sales/SalesHistoryView.vue')
				},
				{
					path: 'sales/edit/:id',
					name: 'sales-edit',
					component: () => import('../views/sales/SalesEditView.vue')
				},
				{
					path: 'products',
					name: 'products-list',
					component: () => import('../views/products/ProductsListView.vue')
				},
				{
					path: 'products/create',
					name: 'products-create',
					component: () => import('../views/products/ProductCreateView.vue')
				},
				{
					path: 'products/edit/:id',
					name: 'products-edit',
					component: () => import('../views/products/ProductEditView.vue')
				},
				{
					path: 'inventory',
					name: 'inventory-list',
					component: () => import('../views/inventory/InventoryListView.vue')
				},
				{
					path: 'purchasing',
					name: 'purchasing-list',
					component: () => import('../views/purchasing/PurchasingListView.vue')
				},
				{
					path: 'purchasing/create',
					name: 'purchasing-create',
					component: () => import('../views/purchasing/PurchasingCreateView.vue')
				},
				{
					path: 'purchasing/edit/:id',
					name: 'purchasing-edit',
					component: () => import('../views/purchasing/PurchasingEditView.vue')
				},
				{
					path: 'materials',
					name: 'materials-list',
					component: () => import('../views/materials/MaterialsListView.vue')
				},
				{
					path: 'materials/create',
					name: 'materials-create',
					component: () => import('../views/materials/MaterialCreateView.vue')
				},
				{
					path: 'materials/edit/:id',
					name: 'materials-edit',
					component: () => import('../views/materials/MaterialEditView.vue')
				},
				{
					path: 'production',
					name: 'production-list',
					component: () => import('../views/production/ProductionListView.vue')
				},
				{
					path: 'production/create',
					name: 'production-create',
					component: () => import('../views/production/ProductionCreateView.vue')
				},
				{
					path: 'production/edit/:id',
					name: 'production-edit',
					component: () => import('../views/production/ProductionEditView.vue')
				},
				{
					path: 'operationals',
					name: 'operationals-list',
					component: () => import('../views/operationals/OperationalsListView.vue')
				},
				{
					path: 'operationals/create',
					name: 'operationals-create',
					component: () => import('../views/operationals/OperationalCreateView.vue')
				},
				{
					path: 'operationals/edit/:id',
					name: 'operationals-edit',
					component: () => import('../views/operationals/OperationalEditView.vue')
				},
				{
					path: 'users',
					name: 'users-list',
					component: () => import('../views/users/UsersListView.vue')
				},
				{
					path: 'users/create',
					name: 'users-create',
					component: () => import('../views/users/UserCreateView.vue')
				},
				{
					path: 'users/edit/:id',
					name: 'users-edit',
					component: () => import('../views/users/UserEditView.vue')
				},
				{
					path: 'profile',
					name: 'profile-view',
					component: () => import('../views/profile/ProfileView.vue')
				},
				{
					path: 'profile/edit',
					name: 'profile-edit',
					component: () => import('../views/profile/ProfileEditView.vue')
				}
			]
		}
	]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem('token')

	if (to.meta.requiresAuth && !token) {
		// Jika halaman butuh login tapi tidak ada token
		next({ name: 'login' })
	} else if (to.meta.requiresGuest && token) {
		// Jika pengguna sudah login tapi mencoba akses halaman auth (login/register)
		next({ name: 'dashboard' })
	} else {
		next()
	}
})

export default router
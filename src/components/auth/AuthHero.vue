<template>
  <div
    class="relative hidden lg:flex flex-col justify-between w-1/2 min-h-screen bg-[#0A0D1D] text-white p-12 overflow-hidden">
    <!-- Gradient Glow Background -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Brand -->
    <div class="relative z-10 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span class="font-bold text-lg tracking-tight">Finance <span class="text-indigo-400">Copilot</span></span>
      <span
        class="ml-2 text-[10px] font-semibold tracking-wider text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-2.5 py-0.5 rounded-full">
        ● AI-Powered Financial Copilot
      </span>
    </div>

    <!-- Center Content -->
    <div class="relative z-10 my-auto max-w-xl text-left">
      <h1 class="text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
        Empower Your Business with <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Real-Time Financial Intelligence
        </span>
      </h1>
      <p class="text-gray-400 text-sm leading-relaxed mb-8">
        Automate production costing, streamline multi-channel sales, and unlock proactive financial insights tailored
        for global business expansion.
      </p>

      <!-- Metric Cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p class="text-2xl font-bold text-white">$142.5K</p>
          <p class="text-xs text-gray-400 mt-1">Simulated 30-Day Revenue</p>
        </div>
        <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p class="text-2xl font-bold text-emerald-400">+20.2%</p>
          <p class="text-xs text-gray-400 mt-1">Projected Operating Margin</p>
        </div>
      </div>
    </div>

    <!-- Footer Security Badge -->
    <div class="relative z-10 flex items-center justify-between text-xs text-gray-500">
      <span>Global Fintech Competition Edition - 2026</span>
      <span class="flex items-center gap-1">
        <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Enterprise-Grade Security
      </span>
    </div>
  </div>
</template>
<script setup>
defineProps({
  size: { type: Number, default: 24 }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lg-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg-grad)"/>
    <path
      d="M10 12.5C10 11.6716 10.6716 11 11.5 11H20.5C21.3284 11 22 11.6716 22 12.5V18.5C22 19.3284 21.3284 20 20.5 20H14L11 22.5V20H11.5C10.6716 20 10 19.3284 10 18.5V12.5Z"
      fill="white"
    />
    <circle cx="13.5" cy="15.5" r="1" fill="#6366f1"/>
    <circle cx="18.5" cy="15.5" r="1" fill="#6366f1"/>
  </svg>
</template>

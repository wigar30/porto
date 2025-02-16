<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { renderBackground, works } from './utils'

defineOptions({
  name: 'HomeView',
})

const timeout = ref<number>()
const isAnimated = ref<boolean>(false)
const isFlash = ref<boolean>(false)

onMounted(() => {
  const canvas = document.getElementById('canvas')! as HTMLCanvasElement
  renderBackground(canvas)

  if (timeout.value) clearTimeout(timeout.value)
  timeout.value = setTimeout(() => {
    isAnimated.value = true
  }, 200)
})

/**
 * Handle Flash
 * remove flash after .5 s
 */
const handleFlash = () => {
  isFlash.value = true

  if (timeout.value) clearTimeout(timeout.value)
  timeout.value = setTimeout(() => {
    isFlash.value = false
  }, 600)
}
</script>

<template>
  <canvas id="canvas" style="position: fixed; width: 100vw; height: 100vh; padding: 0; margin: 0; z-index: -1"></canvas>
  <main class="w-full overflow-x-hidden relative flex flex-col justify-center items-center">
    <div class="w-screen min-h-screen">
      <div class="mt-6 ml-2">
        <div class="flex">
          <p class="text-4xl sm:text-7xl font-black fade-out text-primary-900 dark:text-primary-200 select-none cursor-default" :class="isAnimated ? 'fade-in' : ''">Hey. I'm Wigar</p>
          <p class="text-4xl sm:text-7xl font-black delay-100 duration-1000 text-primary-900 dark:text-primary-200 transition-opacity font-display select-none cursor-default" :class="isAnimated ? 'fade-in' : 'fade-out'">,</p>
        </div>
        <p class="italic ml-4 text-3xl sm:text-6xl font-display font-medium text-primary-900 dark:text-primary-200 whitespace-pre-wrap fade-out grad transition-all select-none cursor-default" :class="isAnimated ? 'fade-in' : ''">
          a frontend developer
        </p>
      </div>
    </div>

    <div class="w-screen min-h-screen">
      <div v-for="(content, index) in works" :key="index" class="w-2/5 pl-10 flex flex-col items-end mt-10">
        <div class="w-full">
          <p class="w-fit mb-6 text-xl sm:text-7xl font-medium text-primary-400 float-end">
            {{ content.name }}
          </p>
        </div>

        <div class="w-full flex flex-col items-start space-y-6">
          <div v-for="(item, index) in content.items" :key="index" class="w-full z-10 animate-wrap relative" @click="handleFlash">
            <div class="w-full flex flex-none flex-col items-start space-y-2 bg-transparent rounded-lg cursor-pointer group/grad">
              <p class="text-primary-900 dark:text-primary-100 text-5xl leading-16 group-hover/grad:grad transition-all">{{ item.name }}</p>
              <div class="w-full flex justify-end space-x-2">
                <p v-for="(tag, i) in item.tech" :key="i" class="w-fit text-primary-900 dark:text-primary-100 text-xs sm:text-sm font-normal after:content-['|'] after:ml-2 last:after:content-none">
                  {{ tag }}
                </p>
              </div>
            </div>
            <!-- <p class="-balance pl-12 absolute translate-x-[50%] z-3 top-0">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae, cupiditate minima?</p> -->
          </div>
        </div>
      </div>
    </div>

    <div class="w-screen">
      <div class="w-full h-full flex items-end justify-end">
        <div class="w-2/3 pb-12 text-right">
          <span class="text-primary-900 dark:text-primary-100 font-display"
            >My name is Wigar Kumara Prasojo. I am a frontend developer who lives in the city of Yogyakarta. I have experience in making websites using technologies such as Vuejs, Nuxt, Nextjs, and Tailwindcss. I also have experience in
            making backend applications using Nodejs, Golang, and PHP technologies such as Expressjs, Nestjs, Go-Fiber, Gin Gonic and Laravel or Lumen.</span
          >
        </div>
        <div class="h-[600px] mb-6 pr-6 after:bg-primary-900 dark:after:bg-primary-100 relative after:absolute after:h-full after:w-1 after:bottom-0 after:right-0 after:transition-all after:duration-500" />
      </div>
    </div>
  </main>
</template>

<style>
@reference "../../assets/main.css";
.group\/grad:hover .group-hover\/grad\:grad {
  @apply animate-text bg-clip-text text-transparent;
  background-image: linear-gradient(to right, var(--color-primary-100), var(--color-primary-600), var(--color-primary-100));
}
</style>

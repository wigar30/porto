import type { RandomColor, WorkWrapper } from './types'

export const renderBackground = (canvas: HTMLCanvasElement) => {
  const c = canvas.getContext('2d')!

  // size of canvas
  const imgSize = 512

  canvas.width = imgSize
  canvas.height = imgSize

  // init image data with black pixels
  const image = c.createImageData(imgSize, imgSize)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = 0 // R
    image.data[i + 1] = 0 // G
    image.data[i + 2] = 0 // B
    image.data[i + 3] = 255 // A
  }

  // size of our height maps
  const mapSize = 1024

  // returns the distance of point x,y from the origin 0,0
  const distance = (x: number, y: number) => Math.sqrt(x * x + y * y)

  // init height map 1
  const heightMap1: number[] = []
  for (let u = 0; u < mapSize; u++) {
    for (let v = 0; v < mapSize; v++) {
      // index of coordinate in height map array
      const i = u * mapSize + v

      // u,v are coordinates with origin at upper left corner
      // cx and cy are coordinates with origin at the
      // center of the map
      const cx = u - mapSize / 2
      const cy = v - mapSize / 2

      // distance from middle of map
      const d = distance(cx, cy)

      // stretching so we get the desired ripple density on our map
      const stretch = (3 * Math.PI) / (mapSize / 2)

      // wavy height value between -1 and 1
      const ripple = Math.sin(d * stretch)

      // wavy height value normalized to 0..1
      const normalized = (ripple + 1) / 2

      // height map value 0..128, integer
      heightMap1[i] = Math.floor(normalized * 128)
    }
  }

  const heightMap2: number[] = []
  for (let u = 0; u < mapSize; u++) {
    for (let v = 0; v < mapSize; v++) {
      const i = u * mapSize + v
      const cx = u - mapSize / 2
      const cy = v - mapSize / 2

      // skewed distance as input to chaos field calculation,
      // scaled for smoothness over map distance
      const d1 = distance(0.8 * cx, 1.3 * cy) * 0.022
      const d2 = distance(1.35 * cx, 0.45 * cy) * 0.022

      const s = Math.sin(d1)
      const c = Math.cos(d2)
      // height value between -2 and +2
      const h = s + c

      // height value between 0..1
      const normalized = (h + 2) / 4
      // height value between 0..127, integer
      heightMap2[i] = Math.floor(normalized * 127)
    }
  }

  // color helpers
  const interpolate = (c1: RandomColor, c2: RandomColor, f: number): RandomColor => {
    return {
      r: Math.floor(c1.r + (c2.r - c1.r) * f),
      g: Math.floor(c1.g + (c2.g - c1.g) * f),
      b: Math.floor(c1.b + (c2.b - c1.b) * f),
    }
  }

  // Replace random color functions with fixed color palette
  const makeSingleColorPalette = () => {
    const c1 = { r: 61, g: 61, b: 61 }
    const c2 = { r: 79, g: 79, b: 79 }
    const c3 = { r: 93, g: 93, b: 93 }
    const c4 = { r: 136, g: 136, b: 136 }
    const c5 = { r: 209, g: 209, b: 209 }

    return makeFiveColorGradient(c1, c2, c3, c4, c5)
  }

  const makeFiveColorGradient = (c1: RandomColor, c2: RandomColor, c3: RandomColor, c4: RandomColor, c5: RandomColor) => {
    const g = []

    for (let i = 0; i < 64; i++) {
      const f = i / 64
      g[i] = interpolate(c1, c2, f)
    }

    for (let i = 64; i < 128; i++) {
      const f = (i - 64) / 64
      g[i] = interpolate(c2, c3, f)
    }

    for (let i = 128; i < 192; i++) {
      const f = (i - 128) / 64
      g[i] = interpolate(c3, c4, f)
    }

    for (let i = 192; i < 256; i++) {
      const f = (i - 192) / 64
      g[i] = interpolate(c4, c5, f)
    }

    return g
  }

  // offsets for moving height maps
  let dx1 = 0
  let dy1 = 0

  let dx2 = 0
  let dy2 = 0

  // adjust height maps offsets
  const moveHeightMaps = (t: number) => {
    dx1 = Math.floor((((Math.cos(t * 0.0002 + 0.4 + Math.PI) + 1) / 2) * mapSize) / 2)
    dy1 = Math.floor((((Math.cos(t * 0.0003 - 0.1) + 1) / 2) * mapSize) / 2)
    dx2 = Math.floor((((Math.cos(t * -0.0002 + 1.2) + 1) / 2) * mapSize) / 2)
    dy2 = Math.floor((((Math.cos(t * -0.0003 - 0.8 + Math.PI) + 1) / 2) * mapSize) / 2)
  }

  // two palettes we interpolate between
  const palettes = [makeSingleColorPalette(), makeSingleColorPalette()]

  // current palette is edstablished durting animation
  const palette: RandomColor[] = []

  const updatePalette = () => {
    // Simply use the first palette for all colors
    for (let i = 0; i < 256; i++) {
      palette[i] = palettes[0][i]
    }
  }

  const updateImageData = () => {
    for (let u = 0; u < imgSize; u++) {
      for (let v = 0; v < imgSize; v++) {
        // indexes into height maps for pixel
        const i = (u + dy1) * mapSize + (v + dx1)
        const k = (u + dy2) * mapSize + (v + dx2)

        // index for pixel in image data
        // remember it's 4 bytes per pixel
        const j = u * imgSize * 4 + v * 4

        // height value of 0..255
        const h = heightMap1[i] + heightMap2[k]
        // get color value from current palette
        const c = palette[h]

        // set pixel data
        image.data[j] = c.r
        image.data[j + 1] = c.g
        image.data[j + 2] = c.b
      }
    }
  }

  // Add scroll-based color generation
  const getScrollBasedColors = () => {
    const scrollPosition = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const scrollProgress = (scrollPosition / maxScroll) * 100

    // Base color changes from purple to blue based on scroll
    return {
      c1: { r: 61 + scrollProgress, g: 61 + scrollProgress, b: 61 + scrollProgress },
      c2: { r: 79 + scrollProgress * 0.8, g: 79 + scrollProgress * 0.8, b: 79 + scrollProgress * 0.8 },
      c3: { r: 93 + scrollProgress * 0.8, g: 93 + scrollProgress * 0.8, b: 93 + scrollProgress * 0.8 },
      c4: { r: 136 - scrollProgress * 0.3, g: 136 - scrollProgress * 0.3, b: 136 - scrollProgress * 0.3 },
      c5: { r: 209 - scrollProgress * 1.2, g: 209 - scrollProgress * 1.2, b: 209 - scrollProgress * 1.2 },
    }
  }

  const makeSingleColorPalettes = () => {
    const colors = getScrollBasedColors()

    return makeFiveColorGradient(colors.c1, colors.c2, colors.c3, colors.c4, colors.c5)
  }

  const tick = (time: number) => {
    moveHeightMaps(time)
    palettes[0] = makeSingleColorPalettes() // Update palette based on current scroll
    updatePalette()
    updateImageData()

    c.putImageData(image, 0, 0)

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

/**
 * Work Section
 */
export const works: WorkWrapper[] = [
  {
    name: 'My Works',
    items: [
      {
        name: 'Gameskii Landing Page',
        desc: '',
        color: 'blue',
        tech: ['Vue.js', 'TailwindCSS'],
      },
      {
        name: 'Gameskii Dashboard',
        desc: '',
        tech: ['Vue.js', 'Chart.js', 'TailwindCSS'],
      },
      {
        name: 'Perhutani Asme',
        desc: '',
        tech: ['Nuxt', 'PWA', 'TailwindCSS', 'Laravel'],
      },
      {
        name: 'Gredu SMS Dashboard',
        desc: '',
        tech: ['Next.js', 'React Query', 'Ant Design'],
      },
      {
        name: 'SocioTrade',
        desc: '',
        tech: ['Nuxt', 'TailwindCSS'],
      },
      {
        name: 'SocioForest',
        desc: '',
        tech: ['Nuxt', 'TailwindCSS'],
      },
    ],
  },
  {
    name: 'My Projects',
    items: [
      {
        name: 'Portofolio',
        desc: 'This Project use Nuxt v3, because I want to learn the newest Nuxt major update and getting to know about composition api',
        tech: ['Nuxt.js', 'TailwindCSS', 'Nuxt UI'],
      },
    ],
  },
]

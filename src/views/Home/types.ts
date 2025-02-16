export type RandomColor = {
  r: number
  g: number
  b: number
}

export type WorkWrapper = {
  name: string
  items: Work[]
}

export type Work = {
  name: string
  desc: string
  color?: string
  tech: string[]
  images?: string[]
}

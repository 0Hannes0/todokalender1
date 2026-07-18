/**
 * Generates PNG app icons using pure Node.js (no native dependencies).
 * Draws: bordeaux rounded-square background + simple white calendar icon.
 * Uses a minimal PNG encoder (no zlib, uses uncompressed PNG with filter byte).
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { deflateSync } from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function writePNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA, row-major
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const crcBuf = Buffer.concat([typeBytes, data])
    let crc = 0xffffffff
    for (const b of crcBuf) {
      crc ^= b
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    crc = (~crc) >>> 0
    const crcOut = Buffer.alloc(4); crcOut.writeUInt32BE(crc)
    return Buffer.concat([len, typeBytes, data, crcOut])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0 // RGB

  // Build raw image data (filter byte 0 per row) — RGB only
  const raw = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0 // filter none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      const dst = y * (width * 3 + 1) + 1 + x * 3
      raw[dst]     = pixels[src]
      raw[dst + 1] = pixels[src + 1]
      raw[dst + 2] = pixels[src + 2]
    }
  }
  const compressed = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function makeIcon(size) {
  const pixels = new Uint8Array(size * size * 4)

  // Bordeaux background color
  const BG = [0x8b, 0x1a, 0x4a]
  const WHITE = [255, 255, 255]
  const TRANSPARENT = [0xf5, 0xf5, 0xf7]

  const radius = Math.round(size * 0.22)

  function setPixel(x, y, rgb, alpha = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    // Alpha blend onto bg
    const a = alpha / 255
    pixels[i]     = Math.round(rgb[0] * a + TRANSPARENT[0] * (1 - a))
    pixels[i + 1] = Math.round(rgb[1] * a + TRANSPARENT[1] * (1 - a))
    pixels[i + 2] = Math.round(rgb[2] * a + TRANSPARENT[2] * (1 - a))
    pixels[i + 3] = 255
  }

  function inRoundedRect(x, y, rx, ry, rw, rh, r) {
    // Is (x,y) inside a rounded rect?
    const dx = Math.max(rx - x, 0, x - (rx + rw))
    const dy = Math.max(ry - y, 0, y - (ry + rh))
    return dx * dx + dy * dy <= r * r
  }

  // Draw rounded background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inside = inRoundedRect(x, y, radius, radius, size - radius * 2, size - radius * 2, radius)
      setPixel(x, y, inside ? BG : TRANSPARENT, inside ? 255 : 0)
    }
  }

  const sw = size * 0.06 // stroke width
  const pad = size * 0.18

  // Helper: draw a filled rectangle
  function fillRect(rx, ry, rw, rh, color, alpha = 255) {
    for (let y = Math.floor(ry); y <= Math.ceil(ry + rh); y++) {
      for (let x = Math.floor(rx); x <= Math.ceil(rx + rw); x++) {
        setPixel(x, y, color, alpha)
      }
    }
  }

  // Helper: draw a circle
  function fillCircle(cx, cy, r, color, alpha = 255) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if (d <= r) setPixel(x, y, color, alpha)
      }
    }
  }

  // Helper: draw a thick line
  function drawLine(x1, y1, x2, y2, thickness, color) {
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const steps = Math.ceil(len * 2)
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      fillCircle(x, y, thickness / 2, color)
    }
  }

  const iw = size - pad * 2  // icon area width
  const ix = pad, iy = pad   // icon area origin

  // Calendar body border (rounded rect outline)
  const cbx = ix + iw * 0.08, cby = iy + iw * 0.18
  const cbw = iw * 0.84, cbh = iw * 0.70
  const cbr = iw * 0.1

  // Fill calendar body
  for (let y = Math.floor(cby); y <= Math.ceil(cby + cbh); y++) {
    for (let x = Math.floor(cbx); x <= Math.ceil(cbx + cbw); x++) {
      const ins = inRoundedRect(x, y, cbx + cbr, cby + cbr, cbw - cbr * 2, cbh - cbr * 2, cbr)
      if (ins) setPixel(x, y, WHITE, 40)
    }
  }

  // Calendar border stroke
  for (let y = Math.floor(cby - sw); y <= Math.ceil(cby + cbh + sw); y++) {
    for (let x = Math.floor(cbx - sw); x <= Math.ceil(cbx + cbw + sw); x++) {
      const distOuter = Math.min(
        Math.abs(x - cbx), Math.abs(x - (cbx + cbw)),
        Math.abs(y - cby), Math.abs(y - (cby + cbh))
      )
      const insOuter = inRoundedRect(x, y, cbx + cbr, cby + cbr, cbw - cbr * 2, cbh - cbr * 2, cbr)
      const insInner = inRoundedRect(x, y, cbx + cbr + sw, cby + cbr + sw, cbw - (cbr + sw) * 2, cbh - (cbr + sw) * 2, cbr)
      if (insOuter && !insInner) setPixel(x, y, WHITE, 230)
    }
  }

  // Header band
  fillRect(cbx, cby, cbw, iw * 0.2, WHITE, 60)

  // Knob lines
  drawLine(ix + iw * 0.33, iy + iw * 0.06, ix + iw * 0.33, iy + iw * 0.26, sw * 1.2, WHITE)
  drawLine(ix + iw * 0.67, iy + iw * 0.06, ix + iw * 0.67, iy + iw * 0.26, sw * 1.2, WHITE)

  // Grid dots (2 rows × 3 cols, minus last dot)
  const dotR = iw * 0.06
  const dotAlpha = 220
  const cols = [0.28, 0.5, 0.72]
  const rows = [0.58, 0.76]
  for (const row of rows) {
    for (const col of cols) {
      if (row === 0.76 && col === 0.72) continue // skip last dot
      fillCircle(ix + iw * col, iy + iw * row, dotR, WHITE, dotAlpha)
    }
  }

  return pixels
}

for (const size of [180, 192, 512]) {
  const pixels = makeIcon(size)
  const png = writePNG(size, size, pixels)
  const outPath = join(outDir, `icon-${size}.png`)
  writeFileSync(outPath, png)
  console.log(`✓ ${outPath} (${png.length} bytes)`)
}

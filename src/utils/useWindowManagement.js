import { ref, reactive, watch } from 'vue'
import { store } from '@/utils/store'

export function useWindowManagement() {
  // 窗口系统：自由拖动/缩放/重叠（无可见外框）
  const windows = ref([
    { id: 'viewer', x: 40, y: 40, w: 480, h: 270, z: 2 },
    { id: 'anime',  x: 540, y: 80, w: 480, h: 270, z: 1 },
  ])

  const bringToFront = (id) => {
    if (store.forcedTop !== 'none' && id !== store.forcedTop) {
      // 如果有強制置頂，且當前點擊的不是置頂窗口，則不改變層級（或者確保置頂窗口依然最高）
      const topWin = windows.value.find(w => w.id === store.forcedTop)
      const otherWin = windows.value.find(w => w.id === id)
      if (topWin && otherWin) {
        otherWin.z = 1
        topWin.z = 2
      }
      return
    }
    
    const maxZ = Math.max(...windows.value.map(w => w.z))
    const win = windows.value.find(w => w.id === id)
    if (win) win.z = maxZ + 1
  }

  // 监听 store.forcedTop 变化并应用层级
  watch(() => store.forcedTop, (val) => {
    if (val === 'viewer') {
      const v = windows.value.find(w => w.id === 'viewer')
      const a = windows.value.find(w => w.id === 'anime')
      if (v && a) { v.z = 2; a.z = 1; }
    } else if (val === 'anime') {
      const v = windows.value.find(w => w.id === 'viewer')
      const a = windows.value.find(w => w.id === 'anime')
      if (v && a) { v.z = 1; a.z = 2; }
    }
  })

  const drag = reactive({
    isDragging: false,
    dragId: null,
    startMouseX: 0,
    startMouseY: 0,
    startX: 0,
    startY: 0,
    isResizing: false,
    resizeId: null,
    startW: 0,
    startH: 0,
    currentX: 0,
    currentY: 0,
  })

  const onPaneMouseDown = (win, e) => {
    // 整个窗格可拖动（恢复第一版易用拖动），无需按键/模式
    if (e.type === 'mousedown' && e.button !== 0) return
    if (store.fullScreen === win.id) return
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
    
    bringToFront(win.id)
    drag.isDragging = true
    drag.dragId = win.id
    drag.startMouseX = clientX
    drag.startMouseY = clientY
    drag.currentX = clientX
    drag.currentY = clientY
    drag.startX = win.x
    drag.startY = win.y
  }

  const onResizeMouseDown = (win, e) => {
    if (e.type === 'mousedown' && e.button !== 0) return
    if (store.fullScreen === win.id) return
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
    
    drag.isResizing = true
    drag.resizeId = win.id
    drag.startMouseX = clientX
    drag.startMouseY = clientY
    drag.currentX = clientX
    drag.currentY = clientY
    drag.startW = win.w
    drag.startH = win.h
  }

  const onWindowsMouseMove = (e) => {
    if (!drag.isDragging && !drag.isResizing) return
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY

    drag.currentX = clientX
    drag.currentY = clientY

    if (drag.isDragging && drag.dragId) {
      const win = windows.value.find(w => w.id === drag.dragId)
      if (!win) return
      const nx = drag.startX + (clientX - drag.startMouseX)
      const ny = drag.startY + (clientY - drag.startMouseY)
      const maxX = window.innerWidth - 50
      const maxY = window.innerHeight - 50
      win.x = Math.max(0, Math.min(nx, maxX))
      win.y = Math.max(0, Math.min(ny, maxY))
    } else if (drag.isResizing && drag.resizeId) {
      const win = windows.value.find(w => w.id === drag.resizeId)
      if (!win) return
      const nw = Math.max(180, drag.startW + (clientX - drag.startMouseX))
      const nh = Math.max(120, drag.startH + (clientY - drag.startMouseY))
      const maxW = window.innerWidth - win.x
      const maxH = window.innerHeight - win.y
      win.w = Math.min(nw, maxW)
      win.h = Math.min(nh, maxH)
    }
  }

  const onWindowsMouseUp = () => {
    drag.isDragging = false
    drag.dragId = null
    drag.isResizing = false
    drag.resizeId = null
  }

  return {
    windows,
    drag,
    bringToFront,
    onPaneMouseDown,
    onResizeMouseDown,
    onWindowsMouseMove,
    onWindowsMouseUp,
  }
}

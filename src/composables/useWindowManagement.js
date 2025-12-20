import { ref, reactive } from 'vue'

export function useWindowManagement() {
  // 窗口系统：自由拖动/缩放/重叠（无可见外框）
  const windows = ref([
    { id: 'viewer', x: 40, y: 40, w: 480, h: 270, z: 2 },
    { id: 'anime',  x: 540, y: 80, w: 480, h: 270, z: 1 },
  ])

  const bringToFront = (id) => {
    const maxZ = Math.max(...windows.value.map(w => w.z))
    const win = windows.value.find(w => w.id === id)
    if (win) win.z = maxZ + 1
  }

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
  })

  const onPaneMouseDown = (win, e) => {
    // 整個窗格可拖動（恢復第一版易用拖動），無需按鍵/模式
    if (e.button !== 0) return
    bringToFront(win.id)
    drag.isDragging = true
    drag.dragId = win.id
    drag.startMouseX = e.clientX
    drag.startMouseY = e.clientY
    drag.startX = win.x
    drag.startY = win.y
  }

  const onResizeMouseDown = (win, e) => {
    if (e.button !== 0) return
    drag.isResizing = true
    drag.resizeId = win.id
    drag.startMouseX = e.clientX
    drag.startMouseY = e.clientY
    drag.startW = win.w
    drag.startH = win.h
  }

  const onWindowsMouseMove = (e) => {
    if (drag.isDragging && drag.dragId) {
      const win = windows.value.find(w => w.id === drag.dragId)
      if (!win) return
      const nx = drag.startX + (e.clientX - drag.startMouseX)
      const ny = drag.startY + (e.clientY - drag.startMouseY)
      const maxX = window.innerWidth - 50
      const maxY = window.innerHeight - 50
      win.x = Math.max(0, Math.min(nx, maxX))
      win.y = Math.max(0, Math.min(ny, maxY))
    } else if (drag.isResizing && drag.resizeId) {
      const win = windows.value.find(w => w.id === drag.resizeId)
      if (!win) return
      const nw = Math.max(180, drag.startW + (e.clientX - drag.startMouseX))
      const nh = Math.max(120, drag.startH + (e.clientY - drag.startMouseY))
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
    bringToFront,
    onPaneMouseDown,
    onResizeMouseDown,
    onWindowsMouseMove,
    onWindowsMouseUp,
  }
}
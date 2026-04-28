import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// Mock ResizeObserver
global.ResizeObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

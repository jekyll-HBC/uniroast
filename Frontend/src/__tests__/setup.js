// Test environment setup — provides a reliable localStorage mock for vitest + jsdom
const store = {}
const localStorageMock = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => { store[key] = String(value) },
  removeItem: (key) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

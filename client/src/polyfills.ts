// Manual Buffer polyfill for Avail Nexus SDK
// This must be imported before any SDK imports

async function setupBufferPolyfill() {
  try {
    // Dynamically import Buffer to avoid Vite externalization
    const { Buffer } = await import('buffer');
    
    // Set global Buffer
    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer;
      (window as any).global = window;
      (window as any).process = { env: {}, browser: true };
      console.log('✓ Buffer polyfill installed successfully');
      return true;
    }
  } catch (e) {
    console.error('✗ Failed to load Buffer polyfill:', e);
    return false;
  }
  return false;
}

// Auto-execute when imported
export default setupBufferPolyfill();

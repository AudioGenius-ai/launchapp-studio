import {
  setItem,
  getItem,
  removeItem,
  listKeys,
  setEncryptedItem,
  getEncryptedItem,
  setStoragePath,
  getStorageInfo,
  exists,
  clear
} from 'tauri-plugin-storage-api';

async function basicUsageExample() {
  console.log('=== Basic Storage Usage ===');
  
  // Set storage path (optional, defaults to ~/.launchapp)
  await setStoragePath('/Users/myuser/.myapp-storage');
  
  // Store some user preferences
  await setItem('preferences', {
    theme: 'dark',
    language: 'en',
    notifications: true
  });
  
  // Store app state
  await setItem('app-state', {
    lastOpenedProject: '/path/to/project',
    recentFiles: ['file1.ts', 'file2.ts'],
    windowSize: { width: 1200, height: 800 }
  });
  
  // Retrieve stored data
  const preferences = await getItem('preferences');
  console.log('Preferences:', preferences);
  
  // Check if item exists
  const hasPrefs = await exists('preferences');
  console.log('Has preferences:', hasPrefs);
  
  // List all keys
  const allKeys = await listKeys();
  console.log('All keys:', allKeys);
}

async function encryptedStorageExample() {
  console.log('\n=== Encrypted Storage Usage ===');
  
  const password = 'user-secure-password';
  
  // Store sensitive data
  await setEncryptedItem('api-credentials', {
    apiKey: 'sk-1234567890',
    apiSecret: 'super-secret-key',
    endpoint: 'https://api.example.com'
  }, password);
  
  // Store tokens
  await setEncryptedItem('auth-tokens', {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'refresh-token-here',
    expiresAt: Date.now() + 3600000
  }, password);
  
  // Retrieve encrypted data
  try {
    const credentials = await getEncryptedItem('api-credentials', password);
    console.log('Retrieved credentials:', credentials);
  } catch (error) {
    console.error('Failed to decrypt:', error);
  }
  
  // List all keys including encrypted
  const allKeys = await listKeys(undefined, true);
  console.log('All keys with encrypted:', allKeys);
}

async function namespacedStorageExample() {
  console.log('\n=== Namespaced Storage Usage ===');
  
  // Store user-specific data
  const userId = 'user-123';
  
  await setItem('profile', {
    name: 'John Doe',
    email: 'john@example.com'
  }, userId);
  
  await setItem('settings', {
    emailNotifications: true,
    pushNotifications: false
  }, userId);
  
  // Store workspace-specific data
  const workspaceId = 'workspace-456';
  
  await setItem('config', {
    projectPath: '/projects/my-project',
    buildCommand: 'npm run build'
  }, workspaceId);
  
  // Retrieve from specific namespace
  const userProfile = await getItem('profile', userId);
  console.log('User profile:', userProfile);
  
  const workspaceConfig = await getItem('config', workspaceId);
  console.log('Workspace config:', workspaceConfig);
  
  // Get storage info for namespace
  const userStorageInfo = await getStorageInfo(userId);
  console.log('User storage info:', userStorageInfo);
}

async function storageManagementExample() {
  console.log('\n=== Storage Management ===');
  
  // Get overall storage info
  const info = await getStorageInfo();
  console.log('Storage info:', {
    path: info.basePath,
    totalItems: info.totalItems,
    encryptedItems: info.encryptedItems,
    totalSize: `${(info.totalSize / 1024).toFixed(2)} KB`
  });
  
  // Clear non-encrypted items in a namespace
  await clear('temp-namespace', false);
  
  // Clear all items including encrypted (use with caution!)
  // await clear(undefined, true);
  
  // Remove specific items
  await removeItem('old-data');
  await removeItem('outdated-config', 'workspace-123');
}

// Run examples
async function runExamples() {
  try {
    await basicUsageExample();
    await encryptedStorageExample();
    await namespacedStorageExample();
    await storageManagementExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in tests or demos
export { runExamples };
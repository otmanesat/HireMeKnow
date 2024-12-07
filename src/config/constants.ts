export const APP_CONFIG = {
  API_URL: process.env.API_URL || 'https://api.hiremeknow.com',
  API_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx'],
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
}; 
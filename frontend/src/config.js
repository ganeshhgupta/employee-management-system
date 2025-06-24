// API Configuration for different environments
const config = {
  // In production, API calls go to the same domain (Railway serves both frontend and backend)
  // In development, API calls go to localhost:5000
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? '' // Same domain in production
    : 'http://localhost:5000',
  
  // Other configuration options
  APP_NAME: 'Employee Management System',
  VERSION: '1.0.0'
};

export default config;

// Usage example:
// import config from './config';
// const response = await axios.get(`${config.API_BASE_URL}/api/employees`);
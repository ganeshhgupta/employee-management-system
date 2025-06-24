// API Configuration for split deployment (Frontend on Vercel, Backend on Railway)
const config = {
  // Use the environment variable for Railway backend URL
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Other configuration options
  APP_NAME: 'Employee Management System',
  VERSION: '1.0.0'
};

export default config;

// Usage example:
// import config from './config';
// const response = await axios.get(`${config.API_BASE_URL}/api/employees`);
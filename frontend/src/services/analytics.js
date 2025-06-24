import api from './api';

export const analyticsService = {
  // Get department analytics
  getDepartmentAnalytics: async () => {
    try {
      const response = await api.get('/analytics/departments');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch department analytics' };
    }
  },

  // Get salary analysis
  getSalaryAnalysis: async () => {
    try {
      const response = await api.get('/analytics/salary-analysis');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch salary analysis' };
    }
  },

  // Get employee metrics
  getEmployeeMetrics: async () => {
    try {
      const response = await api.get('/analytics/employee-metrics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employee metrics' };
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
    }
  },

  // Get department comparison
  getDepartmentComparison: async () => {
    try {
      const response = await api.get('/analytics/department-comparison');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch department comparison' };
    }
  }
};
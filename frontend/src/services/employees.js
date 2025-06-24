import api from './api';

export const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employees' };
    }
  },

  // Get single employee
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employee' };
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create employee' };
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update employee' };
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete employee' };
    }
  },

  // Search employees
  searchEmployees: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search employees' };
    }
  }
};
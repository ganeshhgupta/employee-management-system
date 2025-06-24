import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Menu, LogOut, User, BarChart3, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employees';
import { analyticsService } from '../services/analytics';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch recent employees for display (limited)
      const employeeResponse = await employeeService.getEmployees({ limit: 5 });
      setEmployees(employeeResponse.employees || []);
      
      // Fetch real stats from analytics (all employees)
      const statsResponse = await analyticsService.getDashboardStats();
      setStats({
        total: statsResponse.stats.total_employees || 0,
        active: statsResponse.stats.active_employees || 0,
        departments: statsResponse.stats.total_departments || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to basic employee data if analytics fails
      try {
        const response = await employeeService.getEmployees({ limit: 5 });
        setEmployees(response.employees || []);
        
        // Calculate basic stats as fallback
        const total = response.employees?.length || 0;
        const active = response.employees?.filter(emp => emp.status === 'active').length || 0;
        const departments = new Set(response.employees?.map(emp => emp.department).filter(Boolean)).size;
        
        setStats({ total, active, departments });
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchEmployees(); // This will fetch both employees and real stats
      return;
    }

    try {
      setLoading(true);
      // Search employees
      const response = await employeeService.searchEmployees(searchTerm);
      setEmployees(response.employees || []);
      
      // Keep the real stats from database (don't recalculate from search results)
      // Stats should show total company stats, not just search results
      
    } catch (error) {
      console.error('Error searching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EmployeeHub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Manage your employees and track important metrics from your dashboard.
          </p>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions and Search */}
            <div className="bg-white rounded-lg shadow-sm border mb-8">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Employee Management</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search employees..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        Search
                      </button>
                    </form>
                    
                    <Link
                      to="/employees/new"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Employees</h3>
                  <Link
                    to="/employees"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No employees found</p>
                    <Link
                      to="/employees/new"
                      className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Employee
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.department || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.position || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                employee.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {employee.status || 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/employees/${employee.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                View
                              </Link>
                              <Link
                                to={`/employees/${employee.id}/edit`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              </div>

              {/* Analytics Dashboard Card */}
              <Link
                to="/analytics"
                className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">📊</div>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">Analytics Dashboard</h4>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  View detailed insights, interactive charts, and comprehensive employee metrics
                </p>
                <div className="mt-4 flex items-center text-sm text-indigo-200">
                  <span>Explore Analytics</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Manage Employees Card */}
              <Link
                to="/employees"
                className="block bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">👥</div>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">Manage Employees</h4>
                <p className="text-green-100 text-sm leading-relaxed">
                  View all employees, search records, and manage employee information
                </p>
                <div className="mt-4 flex items-center text-sm text-green-200">
                  <span>Manage Team</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Add Employee Card */}
              <Link
                to="/employees/new"
                className="block bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <Plus className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">➕</div>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">Add New Employee</h4>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Quickly add new team members with comprehensive employee information
                </p>
                <div className="mt-4 flex items-center text-sm text-orange-200">
                  <span>Add Employee</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Quick Stats Mini Card */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Rate</span>
                    <span className="font-medium text-green-600">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Departments</span>
                    <span className="font-medium text-blue-600">{stats.departments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium text-gray-900">{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
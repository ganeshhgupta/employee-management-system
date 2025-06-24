import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Building2,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { analyticsService } from '../services/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    departments: [],
    salaryAnalysis: {},
    employeeMetrics: {},
    dashboardStats: {}
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [
        departmentData,
        salaryData,
        metricsData,
        statsData
      ] = await Promise.all([
        analyticsService.getDepartmentAnalytics(),
        analyticsService.getSalaryAnalysis(),
        analyticsService.getEmployeeMetrics(),
        analyticsService.getDashboardStats()
      ]);

      setData({
        departments: departmentData.departments || [],
        salaryAnalysis: salaryData,
        employeeMetrics: metricsData,
        dashboardStats: statsData.stats || {}
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllAnalytics();
    setRefreshing(false);
  };

  // Chart configurations
  const departmentChartData = {
    labels: data.departments.map(d => d.department),
    datasets: [
      {
        label: 'Employee Count',
        data: data.departments.map(d => d.employee_count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
          '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
        ],
        borderColor: [
          '#2563EB', '#059669', '#D97706', '#DC2626',
          '#7C3AED', '#0891B2', '#65A30D', '#EA580C'
        ],
        borderWidth: 1
      }
    ]
  };

  const salaryByDepartmentData = {
    labels: data.salaryAnalysis.salaryByDepartment?.map(d => d.department) || [],
    datasets: [
      {
        label: 'Average Salary ($)',
        data: data.salaryAnalysis.salaryByDepartment?.map(d => d.avg_salary) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  };

  const salaryRangeData = {
    labels: data.salaryAnalysis.salaryRanges?.map(r => r.salary_range) || [],
    datasets: [
      {
        data: data.salaryAnalysis.salaryRanges?.map(r => r.count) || [],
        backgroundColor: [
          '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'
        ],
        borderColor: [
          '#DC2626', '#D97706', '#059669', '#2563EB', '#7C3AED'
        ],
        borderWidth: 2
      }
    ]
  };

  const hireTrendsData = {
    labels: data.employeeMetrics.hireDateTrends?.map(h => `${h.year}-${String(h.month).padStart(2, '0')}`) || [],
    datasets: [
      {
        label: 'New Hires',
        data: data.employeeMetrics.hireDateTrends?.map(h => h.hires) || [],
        fill: false,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const statusDistributionData = {
    labels: data.employeeMetrics.statusDistribution?.map(s => s.status) || [],
    datasets: [
      {
        data: data.employeeMetrics.statusDistribution?.map(s => s.count) || [],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderColor: ['#059669', '#DC2626', '#D97706'],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (this.chart.canvas.id.includes('salary')) {
              return '$' + value.toLocaleString();
            }
            return value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Analytics Dashboard</span>
            </div>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{data.dashboardStats.total_employees || 0}</p>
                <p className="text-sm text-green-600">
                  {data.dashboardStats.active_employees || 0} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Salary</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(data.dashboardStats.avg_salary || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Range: ${(data.dashboardStats.min_salary || 0).toLocaleString()} - ${(data.dashboardStats.max_salary || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">{data.dashboardStats.total_departments || 0}</p>
                <p className="text-sm text-gray-500">Active departments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Hires</p>
                <p className="text-3xl font-bold text-gray-900">{data.dashboardStats.recent_hires || 0}</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Employee Count */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees by Department</h3>
            <div className="h-80">
              <Bar data={departmentChartData} options={chartOptions} />
            </div>
          </div>

          {/* Average Salary by Department */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Salary by Department</h3>
            <div className="h-80">
              <Bar 
                data={salaryByDepartmentData} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Salary Range Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Range Distribution</h3>
            <div className="h-80">
              <Doughnut data={salaryRangeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Employee Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Status</h3>
            <div className="h-80">
              <Pie data={statusDistributionData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Hiring Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trends (Last 12 Months)</h3>
          <div className="h-80">
            <Line data={hireTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Department Details Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Analytics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Payroll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active/Inactive
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.departments.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.employee_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${dept.avg_salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${dept.total_salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-green-600">{dept.active_employees}</span>
                        /
                        <span className="text-gray-500">{dept.inactive_employees}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
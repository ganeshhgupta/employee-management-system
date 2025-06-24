import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { employeeService } from '../../services/employees';
import { useAuth } from '../../context/AuthContext';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployee(id);
      setEmployee(response.employee);
    } catch (error) {
      setError('Failed to fetch employee details');
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await employeeService.deleteEmployee(id);
      navigate('/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. You may need admin privileges.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Not Found</h3>
          <p className="text-gray-500 mb-6">{error || 'The employee you are looking for does not exist.'}</p>
          <Link
            to="/employees"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                to="/employees"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <User className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Employee Details</span>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to={`/employees/${id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Employee Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{employee.position || 'No position specified'}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-3">ID: {employee.employee_id}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status || 'active'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatSalary(employee.salary)}</p>
                <p className="text-sm text-gray-500">Annual Salary</p>
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{employee.email}</p>
                    </div>
                  </div>
                  
                  {employee.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{employee.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {employee.address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900 whitespace-pre-line">{employee.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                <div className="space-y-4">
                  {employee.department && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-gray-900">{employee.department}</p>
                      </div>
                    </div>
                  )}
                  
                  {employee.position && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="text-gray-900">{employee.position}</p>
                      </div>
                    </div>
                  )}
                  
                  {employee.hire_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Hire Date</p>
                        <p className="text-gray-900">{formatDate(employee.hire_date)}</p>
                      </div>
                    </div>
                  )}
                  
                  {employee.salary && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="text-gray-900">{formatSalary(employee.salary)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {(employee.emergency_contact_name || employee.emergency_contact_phone) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergency_contact_name && (
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="text-gray-900">{employee.emergency_contact_name}</p>
                    </div>
                  )}
                  {employee.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <p className="text-gray-900">{employee.emergency_contact_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                {employee.created_at && (
                  <div>
                    <p>Created</p>
                    <p className="text-gray-900">{formatDate(employee.created_at)}</p>
                  </div>
                )}
                {employee.updated_at && (
                  <div>
                    <p>Last Updated</p>
                    <p className="text-gray-900">{formatDate(employee.updated_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Employee</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{employee.first_name} {employee.last_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteEmployee}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
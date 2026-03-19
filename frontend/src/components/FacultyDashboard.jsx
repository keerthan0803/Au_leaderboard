import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents } from '../services/api';

function FacultyDashboard({ user, setUser }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.userId.firstName} ${student.userId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(student => student.department === selectedDepartment);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, students, selectedDepartment, sortConfig]);

  const fetchStudents = async () => {
    try {
      const response = await getAllStudents();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const departments = ['all', ...new Set(students.map(s => s.department))];

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleViewResume = (resumeUrl) => {
    if (!resumeUrl) return;
    
    // Convert base64 to blob and open
    const base64Data = resumeUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    window.open(blobUrl, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold gradient-text hidden sm:block">Faculty Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm text-gray-700 font-medium hidden md:block">{user.firstName} {user.lastName}</span>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm"
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all shadow-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md animate-slideIn">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="card card-hover mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔍</span> Search and Filter Students
            </h2>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, roll number, or department..."
                className="input-field flex-1"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field sm:w-64"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card overflow-hidden custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                      Year
                    </th>
                    <th 
                      onClick={() => handleSort('totalScore')}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      Score {sortConfig.key === 'totalScore' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {student.userId.firstName} {student.userId.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                        Year {student.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                          {student.totalScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-2 text-lg">No students found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedStudent.userId.firstName} {selectedStudent.userId.lastName}
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-600 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800">{selectedStudent.userId.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="text-gray-800">{selectedStudent.rollNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="text-gray-800">{selectedStudent.department} - Year {selectedStudent.year}</p>
                </div>

                {selectedStudent.resumeUrl && (
                  <div>
                    <p className="text-sm text-gray-600">Resume</p>
                    <button
                      onClick={() => handleViewResume(selectedStudent.resumeUrl)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Resume (PDF)
                    </button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-2">Coding Profiles</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStudent.codingProfiles.leetcode && (
                      <div>
                        <p className="text-sm text-gray-600">LeetCode</p>
                        <p className="text-gray-800">{selectedStudent.codingProfiles.leetcode}</p>
                      </div>
                    )}
                    {selectedStudent.codingProfiles.github && (
                      <div>
                        <p className="text-sm text-gray-600">GitHub</p>
                        <p className="text-gray-800">{selectedStudent.codingProfiles.github}</p>
                      </div>
                    )}
                    {selectedStudent.codingProfiles.hackerrank && (
                      <div>
                        <p className="text-sm text-gray-600">HackerRank</p>
                        <p className="text-gray-800">{selectedStudent.codingProfiles.hackerrank}</p>
                      </div>
                    )}
                    {selectedStudent.codingProfiles.codechef && (
                      <div>
                        <p className="text-sm text-gray-600">CodeChef</p>
                        <p className="text-gray-800">{selectedStudent.codingProfiles.codechef}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-2">Performance Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600 mb-1">LeetCode</p>
                      <p className="font-bold text-gray-800">Solved: {selectedStudent.performanceData.leetcode.solved}</p>
                      <p className="text-sm text-gray-600">Rating: {selectedStudent.performanceData.leetcode.contestRating || 0}</p>
                      <p className="text-sm text-gray-600">Contests: {selectedStudent.performanceData.leetcode.contestCount || 0}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600 mb-1">CodeChef</p>
                      <p className="font-bold text-gray-800">Solved: {selectedStudent.performanceData.codechef.solved}</p>
                      <p className="text-sm text-gray-600">Rating: {selectedStudent.performanceData.codechef.rating}</p>
                      <p className="text-sm text-gray-600">Contests: {selectedStudent.performanceData.codechef.contestCount || 0}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600 mb-1">HackerRank</p>
                      <p className="font-bold text-gray-800">Hackos: {selectedStudent.performanceData.hackerrank.solved}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600 mb-1">GitHub</p>
                      <p className="text-sm text-gray-600">Commits: {selectedStudent.performanceData.github.commits || 0}</p>
                      <p className="text-sm text-gray-600">Stars: {selectedStudent.performanceData.github.stars || 0}</p>
                      <p className="text-sm text-gray-600">PRs: {selectedStudent.performanceData.github.prs || 0}</p>
                      <p className="text-sm text-gray-600">Issues: {selectedStudent.performanceData.github.issues || 0}</p>
                    </div>
                    
                    <div className="col-span-2 bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total Score</p>
                      <p className="text-3xl font-bold text-green-700">{selectedStudent.totalScore}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;

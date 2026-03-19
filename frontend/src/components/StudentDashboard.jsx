import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateCodingProfiles, uploadResume, refreshPerformanceData } from '../services/api';

function StudentDashboard({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codingProfiles, setCodingProfiles] = useState({
    leetcode: '',
    hackerrank: '',
    codechef: '',
    github: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getStudentProfile();
      setProfile(response.data);
      setCodingProfiles(response.data.codingProfiles);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCodingProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateCodingProfiles(codingProfiles);
      alert('Coding profiles updated successfully!');
      fetchProfile();
    } catch (err) {
      alert('Failed to update coding profiles');
    } finally {
      setUpdating(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    // Check if file is PDF
    if (resumeFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // Check file size (max 5MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUpdating(true);
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(resumeFile);
      reader.onload = async () => {
        const base64 = reader.result;
        await uploadResume({ resumeData: base64, fileName: resumeFile.name });
        alert('Resume uploaded successfully!');
        fetchProfile();
        setResumeFile(null);
      };
      reader.onerror = () => {
        alert('Failed to read file');
      };
    } catch (err) {
      alert('Failed to upload resume');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefreshData = async () => {
    setUpdating(true);
    try {
      await refreshPerformanceData();
      alert('Performance data refreshed successfully!');
      fetchProfile();
    } catch (err) {
      alert('Failed to refresh data');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleViewResume = () => {
    if (!profile?.resumeUrl) return;
    
    // Convert base64 to blob and open
    const base64Data = profile.resumeUrl.split(',')[1];
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h1 className="text-xl font-bold gradient-text hidden sm:block">Student Dashboard</h1>
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
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm hidden sm:block"
              >
                Profile
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coding Profiles Update */}
            <div className="card card-hover">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Coding Profiles</h2>
              </div>
              <form onSubmit={handleCodingProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">💻</span> LeetCode Username
                  </label>
                  <input
                    type="text"
                    value={codingProfiles.leetcode || ''}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, leetcode: e.target.value })}
                    className="input-field"
                    placeholder="Enter LeetCode username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">🎯</span> HackerRank Username
                  </label>
                  <input
                    type="text"
                    value={codingProfiles.hackerrank || ''}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, hackerrank: e.target.value })}
                    className="input-field"
                    placeholder="Enter HackerRank username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">👨‍🍳</span> CodeChef Username
                  </label>
                  <input
                    type="text"
                    value={codingProfiles.codechef || ''}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, codechef: e.target.value })}
                    className="input-field"
                    placeholder="Enter CodeChef username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">🐙</span> GitHub Username
                  </label>
                  <input
                    type="text"
                    value={codingProfiles.github || ''}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, github: e.target.value })}
                    className="input-field"
                    placeholder="Enter GitHub username"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Profiles'}
                </button>
              </form>
            </div>

            {/* Resume Upload and Performance Stats */}
            <div className="space-y-6">
              <div className="card card-hover">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Resume</h2>
                </div>
                
                {profile?.resumeUrl && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">✓</span>
                        <div>
                          <p className="text-sm font-semibold text-green-800">Resume uploaded successfully!</p>
                          <p className="text-xs text-green-600 mt-1">Your resume is ready to view</p>
                        </div>
                      </div>
                      <button
                        onClick={handleViewResume}
                        className="btn-outline text-xs py-2 px-4"
                      >
                        View PDF
                      </button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleResumeUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 {profile?.resumeUrl ? 'Upload New Resume (PDF only)' : 'Upload Resume (PDF only)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {resumeFile && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {resumeFile.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Uploading...' : (profile?.resumeUrl ? '🔄 Replace Resume' : '📤 Upload Resume')}
                  </button>
                </form>
              </div>

              <div className="card card-hover">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Performance</h2>
                  </div>
                  <button
                    onClick={handleRefreshData}
                    disabled={updating}
                    className="btn-secondary text-xs py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">💻</span>
                      <p className="text-xs font-semibold text-gray-700">LeetCode</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profile?.performanceData?.leetcode?.solved || 0}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">⭐ Rating: {profile?.performanceData?.leetcode?.contestRating || 0}</p>
                      <p className="text-xs text-gray-600">🏆 Contests: {profile?.performanceData?.leetcode?.contestCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">👨‍🍳</span>
                      <p className="text-xs font-semibold text-gray-700">CodeChef</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profile?.performanceData?.codechef?.solved || 0}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">⭐ Rating: {profile?.performanceData?.codechef?.rating || 0}</p>
                      <p className="text-xs text-gray-600">🏆 Contests: {profile?.performanceData?.codechef?.contestCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">🎯</span>
                      <p className="text-xs font-semibold text-gray-700">HackerRank</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profile?.performanceData?.hackerrank?.solved || 0}</p>
                    <p className="text-xs text-gray-600 mt-2">Hackos</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">🐙</span>
                      <p className="text-xs font-semibold text-gray-700">GitHub</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profile?.performanceData?.github?.commits || 0}</p>
                        <p className="text-xs text-gray-600">Commits</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profile?.performanceData?.github?.stars || 0}</p>
                        <p className="text-xs text-gray-600">Stars</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profile?.performanceData?.github?.prs || 0}</p>
                        <p className="text-xs text-gray-600">PRs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profile?.performanceData?.github?.issues || 0}</p>
                        <p className="text-xs text-gray-600">Issues</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-100 mb-1 font-medium">Total Score</p>
                        <p className="text-5xl font-bold text-white">{profile?.totalScore || 0}</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

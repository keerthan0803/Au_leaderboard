import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile } from '../services/api';
import PerformanceGraph from './PerformanceGraph';

function ProfilePage({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getStudentProfile();
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
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

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                Leaderboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-800 font-medium">
                      {profile.userId.firstName} {profile.userId.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-800">{profile.userId.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Roll Number</p>
                    <p className="text-gray-800">{profile.rollNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-gray-800">{profile.department}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="text-gray-800">Year {profile.year}</p>
                  </div>

                  {profile.resumeUrl && (
                    <div>
                      <p className="text-sm text-gray-600">Resume</p>
                      <button
                        onClick={handleViewResume}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View Resume (PDF)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Coding Profiles</h2>
                
                <div className="space-y-2">
                  {profile.codingProfiles.leetcode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">LeetCode:</span>
                      <span className="text-gray-800 font-medium">{profile.codingProfiles.leetcode}</span>
                    </div>
                  )}
                  {profile.codingProfiles.github && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GitHub:</span>
                      <span className="text-gray-800 font-medium">{profile.codingProfiles.github}</span>
                    </div>
                  )}
                  {profile.codingProfiles.hackerrank && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">HackerRank:</span>
                      <span className="text-gray-800 font-medium">{profile.codingProfiles.hackerrank}</span>
                    </div>
                  )}
                  {profile.codingProfiles.codechef && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CodeChef:</span>
                      <span className="text-gray-800 font-medium">{profile.codingProfiles.codechef}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Graphs */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h2>
                
                <PerformanceGraph performanceData={profile.performanceData} />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">LeetCode</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {profile.performanceData.leetcode.solved}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <span>Rating: {profile.performanceData.leetcode.contestRating || 0}</span><br/>
                      <span>Contests: {profile.performanceData.leetcode.contestCount || 0}</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">CodeChef</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {profile.performanceData.codechef.solved}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <span>Rating: {profile.performanceData.codechef.rating}</span><br/>
                      <span>Contests: {profile.performanceData.codechef.contestCount || 0}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">HackerRank</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {profile.performanceData.hackerrank.solved}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Problems Solved
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600 mb-2">GitHub Stats</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-800">{profile.performanceData.github.commits || 0}</p>
                        <p className="text-xs text-gray-500">Commits</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">{profile.performanceData.github.stars || 0}</p>
                        <p className="text-xs text-gray-500">Stars</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">{profile.performanceData.github.prs || 0}</p>
                        <p className="text-xs text-gray-500">PRs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">{profile.performanceData.github.issues || 0}</p>
                        <p className="text-xs text-gray-500">Issues</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 text-white p-4 rounded-lg">
                    <p className="text-sm mb-1">Total Score</p>
                    <p className="text-3xl font-bold">
                      {profile.totalScore}
                    </p>
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

export default ProfilePage;

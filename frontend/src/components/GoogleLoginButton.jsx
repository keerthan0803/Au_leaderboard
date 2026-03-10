import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../services/api';

function GoogleLoginButton({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      // Decode the JWT token from Google
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));

      // Send to backend
      const result = await googleLogin({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        googleId: payload.sub
      });

      localStorage.setItem('user', JSON.stringify(result.data));
      if (setUser) {
        setUser(result.data);
      }
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        }
      );
    }
  }, [window.google]);

  return (
    <div>
      <div id="googleSignInButton" className="w-full"></div>
      <noscript>
        <p className="text-center text-sm text-gray-600 mt-2">
          Please enable JavaScript to use Google Sign-In
        </p>
      </noscript>
    </div>
  );
}

export default GoogleLoginButton;

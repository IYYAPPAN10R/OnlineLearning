import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../config/firebase';

export default function GoogleSignInDebug() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Starting Google sign-in...');
      
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result);
      
      setUser(result.user);
      alert('Google sign-in successful! Check console for details.');
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(`Error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

//   return (
//     <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
//       <h3>Google Sign-In Debug</h3>
      
//       <button 
//         onClick={handleGoogleSignIn} 
//         disabled={loading}
//         style={{ 
//           padding: '10px 20px', 
//           backgroundColor: '#4285f4', 
//           color: 'white', 
//           border: 'none', 
//           borderRadius: '4px',
//           cursor: loading ? 'not-allowed' : 'pointer'
//         }}
//       >
//         {loading ? 'Signing in...' : 'Test Google Sign-In'}
//       </button>

//       {error && (
//         <div style={{ 
//           marginTop: '10px', 
//           padding: '10px', 
//           backgroundColor: '#ffebee', 
//           color: '#c62828',
//           borderRadius: '4px'
//         }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       {user && (
//         <div style={{ 
//           marginTop: '10px', 
//           padding: '10px', 
//           backgroundColor: '#e8f5e8', 
//           color: '#2e7d32',
//           borderRadius: '4px'
//         }}>
//           <strong>Success!</strong> Signed in as: {user.email}
//         </div>
//       )}

//       <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
//         <p><strong>Instructions:</strong></p>
//         <ol>
//           <li>Open browser console (F12)</li>
//           <li>Click the button above</li>
//           <li>Check console for detailed error messages</li>
//           <li>Allow popups if browser blocks them</li>
//         </ol>
//       </div>
//     </div>
//   );
}

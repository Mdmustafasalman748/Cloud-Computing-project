// src/components/ConnectionTest.js
import React, { useState } from 'react';

const ConnectionTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');

    try {
      console.log('🧪 Testing basic connection to backend...');
      
      // Test basic connection with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://expense-tracker-backend-xcpp.onrender.com/api/v1', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log('🧪 Connection response:', response.status, response.statusText);

      if (response.ok) {
        setResult('✅ Backend is accessible!');
      } else {
        setResult(`⚠️ Backend responded with status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('🧪 Connection test error:', error);
      
      if (error.name === 'AbortError') {
        setResult('❌ Connection timeout - Backend might be sleeping (Render free tier)');
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setResult('❌ Network error - Cannot reach backend server');
      } else {
        setResult(`❌ Connection failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration endpoint...');

    try {
      console.log('🧪 Testing registration endpoint...');
      
      const testData = {
        fullName: "Test User",
        email: `test${Date.now()}@example.com`, // Unique email
        password: "test123456"
      };

      console.log('🧪 Sending test registration data:', testData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('https://expense-tracker-backend-xcpp.onrender.com/api/v1/auth/register', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      clearTimeout(timeoutId);

      console.log('🧪 Registration response status:', response.status);
      console.log('🧪 Registration response headers:', response.headers);

      const responseText = await response.text();
      console.log('🧪 Registration response body:', responseText);

      if (response.ok) {
        setResult('✅ Registration endpoint works! Backend is ready.');
      } else {
        let errorMsg = `❌ Registration failed: ${response.status} ${response.statusText}`;
        if (responseText) {
          errorMsg += `\nResponse: ${responseText}`;
        }
        setResult(errorMsg);
      }
    } catch (error) {
      console.error('🧪 Registration test error:', error);
      
      if (error.name === 'AbortError') {
        setResult('❌ Registration timeout - Backend is likely sleeping (Render free tier)\n\nTry waiting 30 seconds and test again.');
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setResult('❌ Network error during registration test');
      } else {
        setResult(`❌ Registration test failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const wakeUpBackend = async () => {
    setLoading(true);
    setResult('Waking up backend (this may take 30-60 seconds)...');

    try {
      console.log('☕ Waking up backend...');
      
      // First, try to hit the base URL to wake up the service
      const wakeupResponse = await fetch('https://expense-tracker-backend-xcpp.onrender.com', {
        method: 'GET',
      });

      console.log('☕ Wakeup response:', wakeupResponse.status);

      // Wait a bit for the service to fully start
      setResult('⏳ Waiting for backend to fully start...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Now test the API
      const apiResponse = await fetch('https://expense-tracker-backend-xcpp.onrender.com/api/v1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (apiResponse.ok) {
        setResult('✅ Backend is now awake and ready!');
      } else {
        setResult(`⚠️ Backend responded but might not be fully ready: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error('☕ Wake up error:', error);
      setResult(`❌ Failed to wake up backend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      border: '2px solid #e5e7eb', 
      margin: '1rem', 
      borderRadius: '12px',
      backgroundColor: '#f9fafb'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>🔧 Backend Connection Test</h3>
      <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
        Use these buttons to diagnose the "Network Error" issue:
      </p>
      
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Testing...' : '🔗 Test Connection'}
        </button>
        
        <button 
          onClick={wakeUpBackend} 
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Waking...' : '☕ Wake Up Backend'}
        </button>
        
        <button 
          onClick={testRegistration} 
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Testing...' : '📝 Test Registration'}
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: result.includes('✅') ? '#d1fae5' : result.includes('⚠️') ? '#fef3c7' : '#fee2e2',
          border: `1px solid ${result.includes('✅') ? '#a7f3d0' : result.includes('⚠️') ? '#fcd34d' : '#fca5a5'}`,
          borderRadius: '8px',
          marginTop: '1rem',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          {result}
        </div>
      )}

      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#eff6ff', 
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#1e40af'
      }}>
        💡 <strong>Tip:</strong> Render.com free tier puts apps to sleep after 15 minutes of inactivity. 
        If you get timeout errors, click "Wake Up Backend" and wait 30-60 seconds.
      </div>
    </div>
  );
};

export default ConnectionTest;
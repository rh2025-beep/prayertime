import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#0a251a',
          backgroundColor: '#edf5f1',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ color: '#166534', marginBottom: '1rem' }}>অ্যাপে সমস্যা দেখা দিয়েছে</h2>
          <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
            {this.state.error?.message || 'সাময়িক ত্রুটি ঘটেছে।'}
          </p>
          <button
            onClick={() => {
              try {
                window.localStorage.clear();
              } catch {}
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: '#166534',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            পুনরায় চাপুন (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)


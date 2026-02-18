import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1E293B',
                            color: '#F8FAFC',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                        },
                        success: {
                            iconTheme: { primary: '#34D399', secondary: '#0F172A' },
                        },
                        error: {
                            iconTheme: { primary: '#F87171', secondary: '#0F172A' },
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)

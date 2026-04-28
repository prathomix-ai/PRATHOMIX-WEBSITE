import React from 'react'

export default function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030712',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: '#0a9090',
        borderRightColor: '#4040b8',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

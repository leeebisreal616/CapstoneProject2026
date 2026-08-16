import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('GCO Portal Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f9f7] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.8} className="w-8 h-8">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">An unexpected error occurred. Please refresh the page or contact the GCO office if the problem persists.</p>
            <button onClick={() => window.location.reload()}
              className="bg-[#085041] text-white text-[14px] font-semibold py-3 rounded-full w-full">
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#faf8f5] text-[#2c221e] flex flex-col items-center justify-center p-6 select-none relative">
                    <div className="max-w-md w-full text-center bg-white border border-red-200 shadow-xl rounded-3xl p-8 md:p-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-700 mb-5">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-serif font-bold text-[#3d271d] mb-2">
                            Something Went Wrong
                        </h2>

                        <p className="text-sm text-[#6e5849] mb-6 leading-relaxed">
                            An unexpected issue occurred while presenting this view. You can reload the page or return to the main dashboard.
                        </p>

                        {this.state.error?.message && (
                            <div className="mb-6 p-3 bg-red-50/70 border border-red-150 rounded-xl text-left">
                                <p className="text-[11px] font-mono text-red-800 break-words line-clamp-3">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white transition-colors font-medium text-sm cursor-pointer shadow-sm"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

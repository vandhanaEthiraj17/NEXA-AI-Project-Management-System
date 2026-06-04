import React from 'react';
import { AlertCircle, RotateCcw, Cpu } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Unhandled React render crash caught by NEXA ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] w-full flex items-center justify-center text-center p-6">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-rose-500/20 bg-gradient-to-tr from-rose-950/5 to-transparent relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <Cpu className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-2">Telemetry Error Flagged</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
              An unhandled exception occurred in the analytical UI layout loop. NEXA AI isolated the module to prevent a global browser thread block.
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-rose-950/30 text-[10px] text-rose-300 font-mono mb-6 max-h-24 overflow-y-auto text-left whitespace-pre-wrap leading-normal">
              {this.state.error?.toString() || "Unknown rendering exception"}
            </div>
            <button 
              onClick={this.handleReset}
              className="w-full bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-xl transition-all duration-200 uppercase tracking-wider font-mono flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              Re-initialize Workspace Node
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err, info) {
    console.error("[ErrorBoundary]", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-bg-surface rounded-xl border border-accent-rose/30">
          <p className="text-accent-rose text-2xl mb-2">⚠️</p>
          <p className="text-text-primary font-medium mb-1">Something went wrong</p>
          <p className="text-text-muted text-sm mb-4">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="px-4 py-2 bg-accent-indigo text-white rounded-lg text-sm hover:bg-accent-indigo/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

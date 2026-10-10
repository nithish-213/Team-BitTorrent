import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, sans-serif"
        }}>
          <div style={{
            backgroundColor: "#1e293b",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
              Application View Recovered
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
              A state formatting error was caught safely. Click below to restore the application state.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <RefreshCw size={16} /> Reset Application View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

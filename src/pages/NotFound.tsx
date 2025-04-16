import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-samsungDark-900">
      <div className="text-center p-8 bg-samsungDark-800 rounded-lg border border-samsungDark-600">
        <h1 className="text-4xl font-bold mb-4 text-samsungGreen-400">404</h1>
        <p className="text-xl text-green-50 mb-4">Oops! Page not found</p>
        <a href="/" className="text-samsungGreen-400 hover:text-samsungAccent-300 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

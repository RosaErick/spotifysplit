import { useEffect, useState } from "react";
import { Navigate, Route, RouteProps } from "react-router";
import { getAccessToken } from "../provider/spotfy";

const ProtectedRoute: React.FC<
  RouteProps & {
    element: React.ReactElement;
  }
> = ({ element, ...routeProps }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      // Put your loading spinner here
      <div>Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Route {...routeProps} element={element} />;
};

export default ProtectedRoute;

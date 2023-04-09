import "../App.css";
import { Container } from "../components/Profile/Container";
import { LoginForm } from "../components/Login/LoginForm";
import { token, logout } from "../provider/spotfy";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";

export const Login = () => {
  const [hasToken, setToken] = useState<string | null | undefined>(null);
  useEffect(() => setToken(token));

  console.log(hasToken);

  if (hasToken) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login">
      <Container>
        <LoginForm />
      </Container>
    </div>
  );
};

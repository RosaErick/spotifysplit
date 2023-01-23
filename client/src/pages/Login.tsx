import "../App.css";
import { Container } from "../components/Container";
import { LoginForm } from "../components/LoginForm";
import { accessToken, logout } from "../provider/spotfy";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";

export const Login = () => {
  const [token, setToken] = useState<string | null | undefined>(null);
  useEffect(() => setToken(accessToken));

  console.log(token);

  if (token) {
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

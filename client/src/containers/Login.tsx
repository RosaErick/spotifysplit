import "../App.css";
import { Container } from "../components/Container";
import { LoginForm } from "../components/LoginForm";
import { accessToken, logout } from "../provider/spotfy";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";

export const Login = () => {
  const [token, setToken] = useState<string | null | undefined>(null);
  useEffect(() => setToken(accessToken));

  return (
    <div>
      <Container>
        {!token && <LoginForm />}
        {token && <Navigate to="/" />}
      </Container>
    </div>
  );
};

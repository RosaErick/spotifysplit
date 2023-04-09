import "../App.css";
import { Container } from "../components/Profile/Container";
import { LoginForm } from "../components/Login/LoginForm";
import { accessToken, logout } from "../provider/spotfy";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";

export const Login = () => {
  const [token, setToken] = useState<string | null | undefined>(null);
  useEffect(() => setToken(accessToken));

  console.log(token);

 

  return (
    <div className="login">
      <Container>
        <LoginForm />
      </Container>
    </div>
  );
};

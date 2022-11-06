import "../App.css";
import { Container } from "../components/Container";
import { LoginForm } from "../components/LoginForm";

export const Login = () => {
  return (
    <div className="App">
      <Container>
        <LoginForm />
      </Container>
    </div>
  );
};

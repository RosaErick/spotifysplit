import { useState } from "react";
import "./App.css";
import { Container } from "./components/Container";
import { LoginForm } from "./components/LoginForm";

function App() {

  return (
    <div className="App">
      <Container>
        <LoginForm />
      </Container>
    </div>
  );
}

export default App;

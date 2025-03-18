import { useState, useEffect, useRef } from "react";

import { Form } from "radix-ui";
import axios from "axios";

import Password from "./Password";
import FormOptions from "./FormOptions";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleCheckbox = () => setIsChecked(!isChecked);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (emailError !== "" || passwordError !== "") {
      hasError = true;
    }

    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      passwordInputRef.current?.focus();
      hasError = true;
    }

    if (!email) {
      setEmailError("O e-mail é obrigatório");
      emailInputRef.current?.focus();
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await axios.post(
        "http://localhost/bioverde/back-end/login/login.php",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert("Login realizado com sucesso!");
        console.log("Usuário:", response.data.user);
      } else {
        alert(response.data.message);
      }
    } catch {
      alert("Erro ao conectar com o servidor");
    }
  };

  const handleError = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);

    if (value.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
    } else {
      setPasswordError("");
    }
  };

  return (
    <Form.Root
      className="h-full box-border px-4 flex flex-col justify-center gap-10 "
      onSubmit={handleSubmit}
    >
      <Form.Field name="title" className="w-full flex justify-center">
        <Form.Label className="font-[koulen] text-4xl md:text-5xl text-white shadow-title tracking-wide">
          Login
        </Form.Label>
      </Form.Field>
      <Form.Field name="email">
        <Form.Label
          htmlFor="email"
          className="font-[open_sans] text-base flex justify-between items-center"
        >
          <span className="shadow-text md:text-lg">Email</span>
          {/* Mensagens de erro para o email */}
          {emailError && (
            <Form.Message className="text-red-500 text-xs">
              {emailError}
            </Form.Message>
          )}
          <Form.Message match="typeMismatch" className="text-red-500 text-xs">
            Insira um e-mail válido
          </Form.Message>
        </Form.Label>
        <Form.Control asChild>
          <input
            type="email"
            id="email"
            ref={emailInputRef}
            placeholder="E-mail"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);

              if (!value) {
                setEmailError("O e-mail é obrigatório");
              } else {
                setEmailError("");
              }
            }}
            className="text-black bg-brancoSal p-2 w-full rounded outline-hidden"
          />
        </Form.Control>
      </Form.Field>
      <Form.Field name="password">
        <Form.Label
          htmlFor="password"
          className="font-[open_sans] text-base flex justify-between items-center"
        >
          <span className="md:text-lg shadow-text">Senha</span>
          {/* Mensagem de erro para a senha */}
          {passwordError && (
            <Form.Message className="text-red-500 text-xs">
              {passwordError}
            </Form.Message>
          )}
        </Form.Label>
        <Form.Control asChild>
          <Password
            passwordFunction={(e) => handleError(e)}
            passwordValue={password}
            passwordInputRef={passwordInputRef}
            passwordPlaceholder="Insira sua senha"
            passwordId="password"
          />
        </Form.Control>
      </Form.Field>
      <Form.Field
        name="link"
        className="w-full flex justify-between items-center"
      >
        <Form.Control asChild>
          <FormOptions handleCheckbox={handleCheckbox} />
        </Form.Control>
      </Form.Field>
      <Form.Submit
        asChild
        className="flex justify-center items-center h-1/10 w-full"
      >
        <button
          type="submit"
          className="font-[koulen] text-xl md:text-2xl text-white bg-verdePigmento cursor-pointer tracking-wide rounded hover:bg-verdeGrama transition sombra"
        >
          Entrar
        </button>
      </Form.Submit>
    </Form.Root>
  );
}

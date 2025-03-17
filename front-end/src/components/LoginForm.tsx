import { useState, useEffect, useRef } from "react";

// import * as Form from "@radix-ui/react-form";
import { Form } from "radix-ui";
import axios from "axios";

import Password from "./Password";
import LinksForm from "./LinksForm";

export default function LoginForm() {
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

    if (emailError !== "" || passwordError !== "") {hasError = true;} 

    if (password.length < 6) { 
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      passwordInputRef.current?.focus();
      hasError = true
    } 

    if (!email) { 
      setEmailError("O e-mail é obrigatório."); 
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
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <Form.Root
      className="h-full box-border p-4 flex flex-col gap-10 "
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
          className="font-[open_sans] text-base md:text-lg shadow-text"
        >
          Email
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
                setEmailError("O e-mail é obrigatório.");
              } else {
                setEmailError(""); 
              }
            }}
            className="text-black bg-brancoSal p-2 w-full rounded outline-hidden"
          />
        </Form.Control>
        {/* Mensagens de erro para o email */}
        {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
        <Form.Message match="typeMismatch" className="text-red-500 text-sm">
          Insira um e-mail válido.
        </Form.Message>
      </Form.Field>
      <Form.Field name="password">
        <Form.Label
          htmlFor="password"
          className="font-[open_sans] text-base md:text-lg shadow-text"
        >
          Senha
        </Form.Label>
        <Form.Control asChild>
          <Password setPassword={setPassword} setPasswordError={setPasswordError} passwordValue={password} passwordInputRef={passwordInputRef} />
        </Form.Control>
        {/* Mensagem de erro para a senha */}
        {passwordError && <span className="text-red-500 text-sm">{passwordError}</span>}
      </Form.Field>
      <Form.Field
        name="link"
        className="w-full flex justify-between items-center"
      >
        <Form.Control asChild>
          <LinksForm handleCheckbox={handleCheckbox} />
        </Form.Control>
      </Form.Field>
      <Form.Submit
        asChild
        className="flex justify-center items-center h-1/8 w-full"
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

import { useState, useEffect, useRef } from "react";

import { Form } from "radix-ui";
import axios from "axios";

import Password from "./Password";
import FormOptions from "./FormOptions";
import Email from "./Email";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  // const [emailError, setEmailError] = useState("");
  // const [passwordError, setPasswordError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleCheckbox = () => setIsChecked(!isChecked);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            O e-mail é obrigatório
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="typeMismatch">
            Insira um e-mail válido
          </Form.Message>
        </Form.Label>
        <Form.Control asChild>
        <Email 
            emailId="email"
            emailInputRef={emailInputRef}
            emailValue={email}
            emailPlaceholder="E-mail"
            emailFunction={(e) => { setEmail(e.target.value); }}
          />
        </Form.Control>
      </Form.Field>
      <Form.Field name="password">
        <Form.Label
          htmlFor="password"
          className="font-[open_sans] text-base flex justify-between items-center"
        >
          <span className="md:text-lg shadow-text">Senha</span>
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            A senha é obrigatória.
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="tooShort">
            A senha deve ter pelo menos 8 caracteres.
          </Form.Message>
        </Form.Label>
        <Form.Control asChild>
          <Password
            passwordFunction={(e) => setPassword(e.target.value)}
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

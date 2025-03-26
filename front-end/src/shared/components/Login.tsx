import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Form, Toast } from "radix-ui";
import { Loader2 } from "lucide-react";
import axios from "axios";

// import Password from "./Password";
import FormOptions from "./FormOptions";
// import Email from "./Email";

import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  // const [emailError, setEmailError] = useState("");
  // const [passwordError, setPasswordError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [isHidden, setIsHidden] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const validatePassword = () => {
    if (!password) {
      setError("A senha é obrigatória.");
    } else if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
    } else {
      setError(""); 
    }
  };
  

  const handleCheckbox = () => setIsChecked(!isChecked);
  const navigate = useNavigate();

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/login/login.php",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        console.log("Usuário:", response.data.user);
        setMessage("")
        setOpen(true);
        setTimeout(() => {
          navigate("/app/dashboard");
        }, 1000);
      } else {
        setMessage(response.data.message);
      }
    } catch {
      setMessage("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
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
          {/* <Email 
              emailId="email"
              emailInputRef={emailInputRef}
              emailValue={email}
              emailPlaceholder="E-mail"
              emailFunction={(e) => { setEmail(e.target.value); }}
          /> */}
          <input
              type="email"
              id="email"
              ref={emailInputRef}
              placeholder="E-mail"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              className={`text-black bg-brancoSal p-2 w-full rounded outline-hidden`}
              required
            />
        </Form.Control>
      </Form.Field>
      <Form.Field name="password">
        <Form.Label
          htmlFor="password"
          className="font-[open_sans] text-base flex justify-between items-center"
        >
          <span className="md:text-lg shadow-text">Senha</span>
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </Form.Label>
        <Form.Control asChild>
          {/* <Password
            passwordFunction={(e) => setPassword(e.target.value)}
            passwordValue={password}
            passwordInputRef={passwordInputRef}
            passwordPlaceholder="Insira sua senha"
            passwordId="password"
          /> */}
          
          <div className="relative">
            <input
              type={isHidden ? "text" : "password"}
              id="password"
              ref={passwordInputRef}
              placeholder="Insira sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePassword}
              className="p-2 rounded text-black bg-brancoSal w-full outline-hidden"
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() => setIsHidden(!isHidden)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

          </div> 
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

      {message && (
          <p className="w-full p-2 text-center rounded-sm bg-corErro">
            {message}
          </p>
      )}

      <Form.Submit
        asChild
        className="flex justify-center items-center h-1/10 w-full"
      >
        <button
          type="submit"
          className="font-[koulen] text-xl md:text-2xl text-white bg-verdePigmento cursor-pointer tracking-wide rounded hover:bg-verdeGrama transition sombra"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin h-7 w-7" />
          ) : (
            "Entrar"
          )}
        </button>
      </Form.Submit>

      <Toast.Provider swipeDirection="right">
          <Toast.Root
          className="fixed bottom-4 right-4 w-80 p-4 rounded-lg text-white bg-verdePigmento shadow-lg"
          open={open}
          onOpenChange={setOpen}
          duration={3000}
        >
          <Toast.Title className="font-bold">Sucesso!</Toast.Title>
          <Toast.Description>Login realizado com sucesso!</Toast.Description>
        </Toast.Root>

        <Toast.Viewport className="fixed bottom-4 right-4" />
      </Toast.Provider>

    </Form.Root>
  );
}

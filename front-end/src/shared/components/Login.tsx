/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Toast } from "radix-ui";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Password from "./Password";
import Email from "./Email";

const MIN_PASSWORD_LENGTH = 8;

export default function Login() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage]     = useState("");
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const navigate                  = useNavigate();

  // evitar loop de auto-login
  const autoLogged = useRef(false);

  // 1) Tenta auto-login ao montar, se houver credenciais salvas
  const handleSubmitAuto = async (autoEmail: string, autoPassword: string) => {
    setMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost/BioVerde/back-end/login/login.php",
        { email: autoEmail, password: autoPassword, remember: true },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      if (data.success) {
        setOpen(true);
        setTimeout(() => navigate("/app/dashboard"), 1000);
      } else {
        setMessage(data.message);
        // limpa se falhar
        localStorage.removeItem("remember");
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
    } catch {
      setMessage("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const remember        = localStorage.getItem("remember") === "true";
    const storedEmail     = localStorage.getItem("email") || "";
    const storedPassword  = localStorage.getItem("password") || "";

    if (
      remember &&
      storedEmail &&
      storedPassword &&
      !autoLogged.current
    ) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setIsChecked(true);
      autoLogged.current = true;
      handleSubmitAuto(storedEmail, storedPassword);
    }
  }, []);

  // 2) Submit manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(
        `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/login/login.php",
        { email, password, remember: isChecked },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      const data = response.data;

      if (data.success) {
        // 3) Armazena ou limpa credenciais localmente
        if (isChecked) {
          localStorage.setItem("remember", "true");
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
        } else {
          localStorage.removeItem("remember");
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        setOpen(true);
        setTimeout(() => navigate("/app/dashboard"), 1000);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  return (
    <Form.Root onSubmit={handleSubmit} className="space-y-6 font-montserrat">
      {/* E-mail */}
      <Form.Field name="email" className="w-full">
        <Form.Label className="text-sm font-medium text-gray-700 flex justify-between items-center">
          <span>E-mail</span>
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            *
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="typeMismatch">
            Insira um e-mail válido*
          </Form.Message>
        </Form.Label>  
        <Form.Control asChild>
          <Email
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="bg-[#F8F7F6] mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Insira seu e-mail"
          />
        </Form.Control>
      </Form.Field>

      {/* Senha */}
      <Form.Field name="password" className="w-full">
        <Form.Label className="text-sm font-medium text-gray-700 flex justify-between items-center">
          <span>Senha</span>
          {passwordTooShort && (
            <p className="text-red-500 text-xs">
              A senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres*
            </p>
          )}
        </Form.Label>
        <Form.Control asChild>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#F8F7F6] mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Insira sua senha"
          />
        </Form.Control>
      </Form.Field>

      {/* Lembrar acesso */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <span>Lembrar o acesso</span>
        </label>
        <Link
          to="/recuperar-senha"
          className="text-sm text-gray-600 hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      {/* Mensagem de erro */}
      {message && (
        <p className="text-red-600 bg-red-100 p-2 text-center rounded">
          {message}
        </p>
      )}

      {/* Botão de Entrar */}
      <Form.Submit asChild>
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded shadow transition duration-200 flex place-content-center cursor-pointer"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Entrar"}
        </button>
      </Form.Submit>

      {/* Toast de sucesso */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className="fixed bottom-4 left-4 w-80 p-4 rounded-lg text-white bg-green-700 shadow-lg z-50"
          open={open}
          onOpenChange={setOpen}
          duration={3000}
        >
          <Toast.Title className="font-bold">Sucesso!</Toast.Title>
          <Toast.Description>
            Login realizado com sucesso!
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 left-4 z-50" />
      </Toast.Provider>
    </Form.Root>
  );
}

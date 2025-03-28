import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Form, Toast } from "radix-ui";
import { Loader2 } from "lucide-react";
import axios from "axios";

import Password from "./Password";
import FormOptions from "./FormOptions";
import Email from "./Email";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleCheckbox = () => setIsChecked(!isChecked);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/login/login.php",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Resposta do back-end:", response.data);

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
    } catch (error) {
      setMessage("Erro ao conectar com o servidor");
      console.error(error);
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
          <span className="shadow-text md:text-lg">Email:</span>

          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            O e-mail é obrigatório* 
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="typeMismatch">
            Insira um e-mail válido* 
          </Form.Message>

        </Form.Label>
        <Form.Control asChild>
          <Email 
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            autoFocus 
          />
        </Form.Control>
      </Form.Field>

      <Form.Field name="password">
        <Form.Label
          htmlFor="password"
          className="font-[open_sans] text-base flex justify-between items-center"
        >
          <span className="md:text-lg shadow-text">Senha:</span>
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            A senha é obrigatória* 
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="tooShort">
            A senha deve ter pelo menos 8 caracteres* 
          </Form.Message>
        </Form.Label>
        <Form.Control asChild>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

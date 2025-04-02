import { Form } from "radix-ui";

type NameProps = React.InputHTMLAttributes<HTMLInputElement> & { };

const Name = ({ ...rest }: NameProps) => {
  
  return (
    <Form.Field name="name" className="flex flex-col">
      <Form.Label className="flex justify-between items-center">
        <span className="text-xl pb-2 font-light">Nome Completo:</span>
        <Form.Message className="text-red-500 text-xs" match="valueMissing">
        Campo obrigatório*
        </Form.Message>
    </Form.Label>
        <Form.Control asChild>
            <input
            type="text"
            name="name"
            id="name"
            placeholder="Digite o nome completo"
            autoComplete="name"
            {...rest}
            className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
            />
        </Form.Control>  
    </Form.Field>
  );
};

export default Name;

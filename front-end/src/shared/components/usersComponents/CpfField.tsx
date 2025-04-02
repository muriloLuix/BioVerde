import { Form } from "radix-ui";

type CpfFieldProps = {
    children: React.ReactNode;
};
 
const CpfField = ({ children }: CpfFieldProps ) => {
  
  return (
    <Form.Field name="cpf" className="flex flex-col">
    <Form.Label className="flex justify-between items-center">
      <span className="text-xl pb-2 font-light">CPF:</span>
      <Form.Message className="text-red-500 text-xs" match="valueMissing">
        Campo obrigatório*
      </Form.Message>
      <Form.Message className="text-red-500 text-xs" match="patternMismatch">
        Formato inválido*
      </Form.Message>
    </Form.Label>
    <Form.Control asChild>
      {children}
    </Form.Control>
  </Form.Field>
  );
};

export default CpfField;
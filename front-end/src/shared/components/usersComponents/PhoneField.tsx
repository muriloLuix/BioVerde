import { Form } from "radix-ui";

type PhoneFieldProps = {
    children: React.ReactNode;
};
 
const PhoneField = ({ children }: PhoneFieldProps ) => {
  
  return (
    <Form.Field name="tel" className="flex flex-col">
    <Form.Label className="flex justify-between items-center">
        <span className="text-xl pb-2 font-light">Telefone:</span>
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

export default PhoneField;
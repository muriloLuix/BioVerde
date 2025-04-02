import { Form } from "radix-ui";

type EmailFieldProps = {
  children: React.ReactNode;
};

const EmailField = ({ children }: EmailFieldProps) => {
  
  return (
    <Form.Field name="email" className="flex flex-col">
    <Form.Label className="flex justify-between items-center">
      <span className="text-xl pb-2 font-light">Email:</span>
      <Form.Message className="text-red-500 text-xs" match="valueMissing">
        O e-mail é obrigatório* 
      </Form.Message>
      <Form.Message className="text-red-500 text-xs" match="typeMismatch">
        Insira um e-mail válido* 
      </Form.Message>
    </Form.Label>
     <Form.Control asChild>
      {children}
     </Form.Control>
  </Form.Field>
  );
};

export default EmailField;

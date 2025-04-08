import { InputMask, InputMaskProps } from "primereact/inputmask";
import { Form } from "radix-ui";
import React from "react";

type InputPropsBase = {
  isSelect?: false;
  withInputMask?: boolean;
  required?: boolean;
  fieldName: string;
  fieldClassname?: string;
  fieldText: string;
  childrenWithOptions?: React.ReactNode;
};

type InputProps =
  | (InputPropsBase & InputMaskProps & { withInputMask: true })
  | (InputPropsBase & React.InputHTMLAttributes<HTMLInputElement> & { withInputMask?: false });

type SelectProps = {
  isSelect: true;
  withInputMask?: false;
  required?: boolean;
  fieldName: string;
  fieldClassname?: string;
  fieldText: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

type SmartFieldProps = InputProps | SelectProps;

const SmartField: React.FC<SmartFieldProps> = ({
  isSelect,
  withInputMask,
  required,
  fieldName,
  fieldClassname,
  children,
  fieldText,
  ...rest
}) => {
  const regex = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    <Form.Field name={regex(fieldName)} className={fieldClassname ? (fieldClassname) : ("flex flex-col")}>
      <Form.Label
        htmlFor={regex(fieldName)}
        className="flex justify-between items-center"
      >
        <span className="text-xl pb-2 font-light">{fieldText}:</span>
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            Campo obrigatório*
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="typeMismatch">
            Insira um e-mail válido*
          </Form.Message>
          <Form.Message className="text-red-500 text-xs" match="patternMismatch">
            Formato inválido*
          </Form.Message>
      </Form.Label>
        {isSelect ? (
          <select
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
            name={regex(fieldName)}
            id={regex(fieldName)}
            required={required}
          >
            {children}
          </select>
        ) : (
          <Form.Control asChild>
            {withInputMask ? (
              <InputMask
                {...(rest as InputMaskProps)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
              />
            ) : (
              <input
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
              />
            )}
          </Form.Control>
        )}
    </Form.Field>
  );
};

export default SmartField;

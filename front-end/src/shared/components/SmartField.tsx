import { InputMask, InputMaskProps } from "primereact/inputmask";
import { Form } from "radix-ui";
import React from "react";

type InputProps = {
  isSelect?: false;
  withInputMask: boolean;
  isRequired: boolean;
  fieldName: string;
  fieldClassname: string;
  childrenWithOptions?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

type SelectProps = {
  isSelect: true;
  withInputMask?: false;
  isRequired: boolean;
  fieldName: string;
  fieldClassname: string;
  childrenWithOptions: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

type SmartFieldProps = InputProps | SelectProps;

const SmartField: React.FC<SmartFieldProps> = ({
  isSelect,
  withInputMask,
  isRequired,
  fieldName,
  fieldClassname,
  childrenWithOptions,
  ...rest
}) => {
  const regex = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    <Form.Field name={regex(fieldName)} className={fieldClassname}>
      <Form.Label
        htmlFor={regex(fieldName)}
        className="flex justify-between items-center"
      >
        <span className="text-xl pb-2 font-light">{fieldName}:</span>
        {isRequired ? (
          <Form.Message className="text-red-500 text-xs" match="valueMissing">
            Campo obrigatório*
          </Form.Message>
        ) : (
          <></>
        )}
        <Form.Message className="text-red-500 text-xs" match="patternMismatch">
          Formato inválido*
        </Form.Message>
      </Form.Label>
      <Form.Control asChild>
        {isSelect ? (
          <select
            name={regex(fieldName)}
            id={regex(fieldName)}
            required={isRequired}
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {childrenWithOptions}
          </select>
        ) : withInputMask ? (
          <InputMask
            name={regex(fieldName)}
            id={regex(fieldName)}
            required={isRequired}
            {...(rest as InputMaskProps)}
          />
        ) : (
          <input
            name={regex(fieldName)}
            id={regex(fieldName)}
            required={isRequired}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </Form.Control>
    </Form.Field>
  );
};

export default SmartField;

import { InputMask, InputMaskProps } from "primereact/inputmask";
import { Form } from "radix-ui";
import React from "react";
import { Loader2 } from "lucide-react";

type InputPropsBase = {
  isSelect?: false;
  isTextArea?: boolean;
  isNumEndereco?: boolean;
  isLoading?: boolean;
  error?: string;
  placeholderOption?: string;
  withInputMask?: boolean;
  required?: boolean;
  fieldName: string;
  fieldClassname?: string;
  fieldText: string;
  childrenWithOptions?: React.ReactNode;
};

type InputProps =
  | (InputPropsBase & InputMaskProps & { withInputMask: true })
  | (InputPropsBase & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & { withInputMask?: false });

type SelectProps = {
  isSelect: true;
  isTextArea?: false;
  isNumEndereco?: boolean;
  isLoading?: boolean;
  error?: string;
  placeholderOption?: string;
  withInputMask?: boolean;
  required?: boolean;
  fieldName: string;
  fieldClassname?: string;
  fieldText: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

type SmartFieldProps = InputProps | SelectProps;

const SmartField: React.FC<SmartFieldProps> = ({
  isSelect,
  isTextArea,
  isNumEndereco,
  withInputMask,
  required,
  fieldName,
  fieldClassname,
  children,
  fieldText,
  isLoading,
  error,
  placeholderOption,
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
        {isSelect ? (
            error && (
              <span className="text-red-500 text-xs">{error}</span>
            )
        ) : (
          <>
            <Form.Message className="text-red-500 text-xs" match="valueMissing">
              {isNumEndereco ? "*" : "Campo obrigatório*"}
            </Form.Message>
            <Form.Message className="text-red-500 text-xs" match="typeMismatch">
              Insira um e-mail válido*
            </Form.Message>
            <Form.Message className="text-red-500 text-xs" match="patternMismatch">
              Formato inválido*
            </Form.Message>
          </>
        )}
      </Form.Label>
        {isSelect ? (
          isLoading ? (
            <div className="bg-white w-[220px] border border-separator rounded-lg p-2.5 shadow-xl flex justify-center">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <select
              {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
              name={regex(fieldName)}
              id={regex(fieldName)}
              required={required}
            >
              {placeholderOption && (
                <option value="" disabled>
                  {placeholderOption}
                </option>
              )}
              {children}
            </select>
          )
        ) : (
          <Form.Control asChild>
            {isTextArea ? (
              <textarea
                {...(rest as React.InputHTMLAttributes<HTMLTextAreaElement>)}
                id={regex(fieldName)}
                name={regex(fieldName)}
                required={required}
                rows={3}
                cols={50}
                autoFocus
                maxLength={500}
              />
            ) : (
              withInputMask ? (
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
              )
            )}
          </Form.Control>
        )}
    </Form.Field>
  );
};

export default SmartField;

import { useState } from "react";
import { InputMask, InputMaskProps } from "primereact/inputmask";
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Form } from "radix-ui";
import React from "react";
import { Loader2, EyeOff, Eye } from "lucide-react";

type InputPropsBase = {
  isSelect?: boolean;
  isTextArea?: boolean;
  isPassword?: boolean;
  isPrice?: boolean;
  isDate?: boolean;
  isNumEndereco?: boolean;
  isLoading?: boolean;
  error?: string;
  inputWidth?: string;
  placeholderOption?: string;
  withInputMask?: boolean;
  required?: boolean;
  fieldName: string;
  fieldClassname?: string;
  fieldText: string;
  children?: React.ReactNode;
  generatePassword?: () => void;
};

type InputProps =
| (InputPropsBase & InputMaskProps)
| (InputPropsBase & React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>)
| (InputPropsBase & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
| (InputPropsBase & NumericFormatProps);

type SmartFieldProps = InputProps;

const SmartField: React.FC<SmartFieldProps> = ({
  isSelect,
  isTextArea,
  isPrice,
  withInputMask,
  required,
  fieldName,
  fieldClassname,
  children,
  fieldText,
  isLoading,
  error,
  placeholderOption,
  inputWidth,
  isPassword,
  isDate,
  generatePassword,
  ...rest
}) => {
  const [isHidden, setIsHidden] = useState(false);

  const regex = (text: string) =>
   text.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    <Form.Field name={regex(fieldName)} className={fieldClassname ? (fieldClassname) : ("flex flex-col")}>
      <Form.Label
        htmlFor={regex(fieldName)}
        className="flex justify-between items-center"
      >
        <span className="text-xl pb-2 font-light">{fieldText}:</span>
        {isSelect || isPassword || isPrice ? (
            error && (
              <span className={`text-red-500 ${error === "*" ? "text-base" : "text-xs"}`}>{error}</span>
            )
        ) : (
          <>
            <Form.Message className="text-red-500 text-base" match="valueMissing">
              *
            </Form.Message>
            <Form.Message className="text-red-500 text-xs" match="typeMismatch">
              Insira um e-mail válido*
            </Form.Message>
            <Form.Message className="text-red-500 text-xs" match="patternMismatch">
              Formato inválido*
            </Form.Message>
            <Form.Message className="text-red-500 text-xs" match="rangeUnderflow">
              Valor inválido*
            </Form.Message>
          </>
        )}
      </Form.Label>
        {isSelect ? (
          isLoading ? (
            <div className={`bg-white ${inputWidth} border border-separator rounded-lg p-2.5 shadow-xl flex justify-center`}>
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <select
              {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
              name={regex(fieldName)}
              id={regex(fieldName)}
              required={required}
              className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl`}
            >
              {placeholderOption && (
                <option value="" disabled>
                  {placeholderOption}
                </option>
              )}
              {children}
            </select>
          )
        ) : isPassword ? (
          <div className="flex gap-2">
            <div className="relative">
              <input
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                type={isHidden ? "text" : "password"}
                id={regex(fieldName)}
                name={regex(fieldName)}
                className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl`}
              />
              {/* Botão de Mostrar/Ocultar Senha */}
              <button
                type="button"
                onClick={() => setIsHidden(!isHidden)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Botão de Gerar Senha Aleatoria */}
            <button
              type="button"
              className="bg-verdeMedio p-2.5 rounded-2xl whitespace-nowrap text-white cursor-pointer hover:bg-verdeEscuro"
              onClick={generatePassword}
            >
              Gerar Senha
            </button>
          </div>
        ) :  (
          <Form.Control asChild>
            {isTextArea ? (
              <textarea
                rows={3}
                cols={50}
                maxLength={500}
                {...(rest as React.InputHTMLAttributes<HTMLTextAreaElement>)}
                id={regex(fieldName)}
                name={regex(fieldName)}
                required={required}
                className="bg-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
              />
            ) : withInputMask ? (
              <InputMask
                {...(rest as InputMaskProps)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
                className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl`}
              />
            ) : isPrice ? (
              <NumericFormat
                {...(rest as NumericFormatProps)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                className={`bg-white border ${inputWidth} border-separator rounded-lg p-2.5 shadow-xl`}
              />
            ) : isDate ? (
              <input
                type="date"
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
                className={`bg-white border ${inputWidth} border-separator rounded-lg p-2.5 shadow-xl`}
              />
            ) : (
              <input
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                name={regex(fieldName)}
                id={regex(fieldName)}
                required={required}
                className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl`}
              />
            )}
          </Form.Control>
        )}
    </Form.Field>
  );
};

export default SmartField;

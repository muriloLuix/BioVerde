import { useState } from "react";

import { GroupBase } from "react-select";
import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { InputMask, InputMaskProps } from "primereact/inputmask";
import { Loader2, EyeOff, Eye } from "lucide-react";
import { Form } from "radix-ui";

type InputPropsBase = {
	isSelect?: boolean;
	isTextArea?: boolean;
	isPassword?: boolean;
	isPrice?: boolean;
	isCreatableSelect?: boolean;
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

type OptionType = {
	label: string;
	value: string;
};

type InputProps =
	| (InputPropsBase & InputMaskProps)
	| (InputPropsBase &
			React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>)
	| (InputPropsBase & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
	| (InputPropsBase & NumericFormatProps)
	| (InputPropsBase & CreatableProps<OptionType, false, GroupBase<OptionType>>);

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
	isCreatableSelect,
	generatePassword,
	...rest
}) => {
	const [isHidden, setIsHidden] = useState(false);

	const regex = (text: string) =>
		text.trim().toLowerCase().replace(/\s+/g, "-");

	return (
		<Form.Field
			name={regex(fieldName)}
			className={fieldClassname ?? "flex flex-col"}
		>
			<Form.Label
				htmlFor={regex(fieldName)}
				className="flex justify-between items-center"
			>
				<span className="text-xl pb-2 font-light">{fieldText}:</span>
				{isSelect || isPassword || isPrice || isCreatableSelect ? (
					error && (
						<span
							className={`text-red-500 ${
								error === "*" ? "text-base" : "text-xs"
							}`}
						>
							{error}
						</span>
					)
				) : (
					<>
						<Form.Message
							className="text-red-500 text-base"
							match="valueMissing"
						>
							*
						</Form.Message>
						<Form.Message className="text-red-500 text-xs" match="typeMismatch">
							Insira um e-mail válido*
						</Form.Message>
						<Form.Message
							className="text-red-500 text-xs"
							match="patternMismatch"
						>
							Formato inválido*
						</Form.Message>
						<Form.Message
							className="text-red-500 text-xs"
							match="rangeUnderflow"
						>
							Valor inválido*
						</Form.Message>
					</>
				)}
			</Form.Label>
			{isSelect ? (
				<select
					{...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
					name={regex(fieldName)}
					id={regex(fieldName)}
					required={required}
					className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0`}
				>
					{isLoading ? (
						<Loader2 className="animate-spin h-5 w-5" />
					) : (
						placeholderOption && (
							<option value="" disabled>
								{placeholderOption}
							</option>
						)
					)}
					{children}
				</select>
			) : isPassword ? (
				<div className="flex gap-7">
					<div className="relative flex-1">
						<input
							{...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
							type={isHidden ? "text" : "password"}
							id={regex(fieldName)}
							name={regex(fieldName)}
							className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0`}
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
			) : isCreatableSelect ? (
				<div className="relative">
					<CreatableSelect
						{...(rest as CreatableProps<
							OptionType,
							false,
							GroupBase<OptionType>
						>)}
						isClearable
						classNamePrefix={"react-select"}
						isLoading={isLoading}
						styles={{
							control: (base) => ({
								...base,
								backgroundColor: "white",
								borderRadius: "0.5rem",
								padding: "0.25rem",
								border: "1px solid #d1d5db",
								boxShadow: "none",
								"&:hover": {
									borderColor: "#9ca3af",
								},
							}),
							menu: (base) => ({
								...base,
								borderRadius: "0.5rem",
								overflow: "hidden",
							}),
							option: (base, state) => ({
								...base,
								backgroundColor: state.isSelected
									? "#4CAF50"
									: state.isFocused
									? "#A5D6A7"
									: "white",
								color: state.isSelected ? "white" : "#374151",
								padding: "0.5rem",
								cursor: "pointer",
							}),
						}}
					/>
				</div>
			) : (
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
							className="bg-white border resize-none border-separator rounded-lg p-2.5 outline-0"
						/>
					) : withInputMask ? (
						<InputMask
							{...(rest as InputMaskProps)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							required={required}
							className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0`}
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
							className={`bg-white border ${inputWidth} border-separator rounded-lg p-2.5 outline-0`}
						/>
					) : (
						<input
							{...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							required={required}
							className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0`}
						/>
					)}
				</Form.Control>
			)}
		</Form.Field>
	);
};

export default SmartField;

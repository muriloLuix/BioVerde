import { useState } from "react";

import { Form } from "radix-ui";
import Select, {
	GroupBase,
	Props,
	components,
	OptionProps,
} from "react-select";
import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { InputMask, InputMaskProps } from "primereact/inputmask";
import { EyeOff, Eye, Plus } from "lucide-react";

import { Option } from "../../utils/types";

type InputPropsBase = {
	isSelect?: boolean;
	isTextArea?: boolean;
	isPassword?: boolean;
	isPrice?: boolean;
	isCreatableSelect?: boolean;
	isNumEndereco?: boolean;
	isLoading?: boolean;
	error?: string;
	value?: string | number;
	inputWidth?: string;
	options?: Option[];
	withInputMask?: boolean;
	required?: boolean;
	fieldName: string;
	fieldClassname?: string;
	fieldText: string;
	children?: React.ReactNode;
	generatePassword?: () => void;
	onChangeSelect?: (e: { target: { name: string; value: string } }) => void;
};

type InputProps =
	| (InputPropsBase & InputMaskProps)
	| (InputPropsBase &
			React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>)
	| (InputPropsBase & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
	| (InputPropsBase & NumericFormatProps)
	| (InputPropsBase & CreatableProps<Option, false, GroupBase<Option>>);

const SmartField = ({
	isSelect,
	isTextArea,
	isPrice,
	withInputMask,
	required,
	fieldName,
	fieldClassname,
	fieldText,
	isLoading,
	error,
	inputWidth,
	isPassword,
	isCreatableSelect,
	options,
	value,
	onChangeSelect,
	generatePassword,
	...rest
}: InputProps) => {
	const [isHidden, setIsHidden] = useState(false);

	const regex = (text: string) =>
		text.trim().toLowerCase().replace(/\s+/g, "-");

	const CustomCreateOption = (
		props: OptionProps<{ label: string; value: string }, false>
	) => {
		if (props.data.value === "nova_opcao") {
			return (
				<components.Option {...props}>
					<div className="flex justify-center items-center gap-1 font-semibold text-black">
						<Plus size={16} />
						<span>{props.data.label}</span>
					</div>
				</components.Option>
			);
		}

		return <components.Option {...props} />;
	};

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
				<div className="relative">
					<Select
						isClearable
						{...(rest as Props<Option, false, GroupBase<Option>>)}
						name={regex(fieldName)}
						id={regex(fieldName)}
						classNamePrefix="react-select"
						className={`react-select-container ${inputWidth}`}
						isLoading={isLoading}
						closeMenuOnSelect
						menuShouldScrollIntoView
						hideSelectedOptions
						components={{ Option: CustomCreateOption }}
						options={options}
						value={options?.find((opt) => opt.value === value) || null}
						onChange={(selectedOption) => {
							onChangeSelect?.({
								target: {
									name: fieldName,
									value: String(selectedOption?.value || ""),
								},
							});
						}}
						styles={{
							control: (base) => ({
								...base,
								borderRadius: "0.5rem",
								minHeight: "45.6px",
								"&:hover": {
									borderColor: "#9ca3af",
								},
							}),
							menu: (base) => ({
								...base,
								borderRadius: "0.5rem",
								overflow: "hidden",
							}),
							option: (base, state) => {
								const isNewOption = state.data.value === "nova_opcao";

								return {
									...base,
									backgroundColor: state.isSelected
										? "#4CAF50"
										: state.isFocused
										? "#A5D6A7"
										: "white",
									color: state.isSelected ? "white" : "#374151", // Texto um pouco mais escuro para destacar
									padding: "0.5rem",
									cursor: "pointer",
									borderBottom: isNewOption ? "1px solid #ccc" : undefined, // linha separadora
								};
							},
						}}
					/>
				</div>
			) : isPassword ? (
				<div className="flex gap-4">
					<div className="relative">
						<input
							{...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
							type={isHidden ? "text" : "password"}
							id={regex(fieldName)}
							name={regex(fieldName)}
							value={value}
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
						{...(rest as CreatableProps<Option, false, GroupBase<Option>>)}
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
							value={value}
							className="bg-white border resize-none border-separator rounded-lg p-2.5 outline-0"
						/>
					) : withInputMask ? (
						<InputMask
							{...(rest as InputMaskProps)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							required={required}
							value={String(value)}
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
							value={value}
							className={`bg-white border ${inputWidth} border-separator rounded-lg p-2.5 outline-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]`}
						/>
					) : (
						<input
							{...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							required={required}
							value={value}
							className={`bg-white ${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] disabled:opacity-60 disabled:bg-gray-200`}
						/>
					)}
				</Form.Control>
			)}
		</Form.Field>
	);
};

export default SmartField;

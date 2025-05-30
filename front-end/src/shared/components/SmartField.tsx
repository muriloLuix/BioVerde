import { useState } from "react";

import { Form } from "radix-ui";
import Select, { GroupBase, Props} from "react-select";
import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { InputMask, InputMaskProps } from "primereact/inputmask";
import { EyeOff, Eye, Settings } from "lucide-react";

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
	value?: string | number | string[];
	inputWidth?: string;
	options?: Option[];
	withInputMask?: boolean;
	required?: boolean;
	fieldName: string;
	fieldClassname?: string;
	fieldText: string;
	userLevel?: string;
	isDisable?: boolean;
	isMulti?: boolean;
	children?: React.ReactNode;
	creatableConfigName?: string;
	openManagementModal?: () => void;
	generatePassword?: () => void;
	onCreateNewOption?: (inputValue: string) => Promise<void>;
	onChangeSelect?: (
		e: { target: { name: string; value: string | string[] } }
	) => void;

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
	isDisable,
	required,
	fieldName,
	fieldClassname,
	fieldText,
	isLoading,
	error,
	isMulti,
	inputWidth,
	isPassword,
	isCreatableSelect,
	options,
	userLevel,
	value,
	creatableConfigName,
	onChangeSelect,
	onCreateNewOption,
	openManagementModal,
	generatePassword,
	...rest
}: InputProps) => {
	const [isHidden, setIsHidden] = useState(false);

	const regex = (text: string) => text.trim().toLowerCase().replace(/\s+/g, "-");

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
				<div className="flex items-center pb-1 gap-2">
					{userLevel === "Administrador" && (
						isCreatableSelect && (
							<button 
								title={creatableConfigName}
								onClick={openManagementModal}
							>
								<Settings size={20} className="text-gray-600 cursor-pointer" />
							</button>
						) 
					)}
					{error && (
						<span
							className={`text-red-500 ${
							error === "*" ? "text-base" : "text-xs"
							}`}
						>
							{error}
						</span>
					)}
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

				</div>
			</Form.Label>
			{isSelect ? (
				<div className="relative">
					{isCreatableSelect ? (
						<CreatableSelect
							isClearable
							{...(rest as CreatableProps<Option, false, GroupBase<Option>>)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							classNamePrefix="react-select"
							className={`react-select-container ${inputWidth}`}
							isLoading={isLoading}
							closeMenuOnSelect
							menuShouldScrollIntoView
							hideSelectedOptions
							noOptionsMessage={() => "Nenhuma opção encontrada"}
							loadingMessage={() => "Carregando..."}
							formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
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
							onCreateOption={async (inputValue) => {
								if (onCreateNewOption) {
									await onCreateNewOption(inputValue);
								}

								onChangeSelect?.({
									target: {
										name: fieldName,
										value: inputValue,
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
					) : (
						<Select
							isClearable
							isMulti={isMulti}
							noOptionsMessage={() => "Nenhuma opção encontrada"}
							{...(rest as Props<Option, boolean, GroupBase<Option>>)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							classNamePrefix="react-select"
							className={`react-select-container ${inputWidth}`}
							isLoading={isLoading}
							closeMenuOnSelect={!isMulti}
							menuShouldScrollIntoView
							hideSelectedOptions
							loadingMessage={() => "Carregando..."}
							options={options}
							value={
								isMulti
									? options?.filter((opt) =>
										Array.isArray(value) ? value.includes(opt.value) : false
									)
									: options?.find((opt) => opt.value === value) || null
							}
							onChange={(selected) => {
								const newValue = isMulti
									? (selected as Option[])?.map((opt) => opt.value) || []
									: (selected as Option)?.value || "";

								onChangeSelect?.({
									target: {
										name: fieldName,
										value: newValue,
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
					)}
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
							value={Array.isArray(value) ? undefined : value}
							className={`bg-white border ${inputWidth} border-separator rounded-lg p-2.5 outline-0`}
						/>
					) : (
						<input
							{...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
							name={regex(fieldName)}
							id={regex(fieldName)}
							required={required}
							value={value}
							className={`${inputWidth} h-[45.6px] border border-separator rounded-lg p-2.5 outline-0 ${isDisable ? "bg-gray-100 text-gray-600 cursor-default" : "bg-white"} [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]`}
						/>
					)}
				</Form.Control>
			)}
		</Form.Field>
	);
};

export default SmartField;
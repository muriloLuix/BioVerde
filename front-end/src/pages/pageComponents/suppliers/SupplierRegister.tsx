import React from "react";
import { SmartField } from "../../../shared";
import { FormDataSupplier, SelectEvent, UF, City } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

type FieldErrors = {
  [key in
    | "states"
    | "cities"
  ]: boolean;
};

interface Props {
  formData: FormDataSupplier;
  loading: Set<string>;
  errors: FieldErrors;
  supplierType: string;
  ufs?: UF[];
  cities?: City[];
  handleCities: (id: number | undefined) => Promise<void>;
  handleCepBlur: () => void;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
      | SelectEvent
  ) => void;
}

const SupplierRegister: React.FC<Props> = ({
  formData,
  loading,
  errors,
  ufs,
  cities,
  supplierType,
  handleCities,
  handleCepBlur,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex gap-7">
            <SmartField
                fieldName="tipo"
                fieldText="Tipo"
                isClearable={false}
                isSelect
                value={formData.tipo}
                fieldClassname="flex flex-col flex-1"
                placeholder="Selecione"
                onChangeSelect={handleChange}
                options={[
                    { value: "juridica", label: "Pessoa Jurídica" },
                    { value: "fisica", label: "Pessoa Física" },
                ]}
            />
            {supplierType === "juridica" && (
                <SmartField
                    fieldName="cpf_cnpj"
                    fieldText="CNPJ"
                    withInputMask
                    unstyled
                    required
                    type="text"
                    mask="99.999.999/9999-99"
                    autoClear={false}
                    pattern="^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$"
                    placeholder="Digite o CNPJ"
                    value={formData.cpf_cnpj}
                    onChange={handleChange}
                    fieldClassname="flex flex-col flex-1"
                />
            )}
            {supplierType === "fisica" && (
                <SmartField
                    fieldName="cpf_cnpj"
                    fieldText="CPF"
                    withInputMask
                    unstyled
                    required
                    type="text"
                    mask="999.999.999-99"
                    autoClear={false}
                    pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                    placeholder="Digite o CPF"
                    value={formData.cpf_cnpj}
                    onChange={handleChange}
                    fieldClassname="flex flex-col flex-1"
                />
            )}
        </div>

        {supplierType === "juridica" && (
            <>
            <SmartField
                fieldName="nome_empresa_fornecedor"
                fieldText="Nome Fantasia da Empresa"
                required
                type="text"
                placeholder="Digite o nome Fantasia da empresa"
                autoComplete="name"
                value={formData.nome_empresa_fornecedor}
                onChange={handleChange}
            />

            <SmartField
                fieldName="razao_social"
                fieldText="Razão Social"
                required
                type="text"
                placeholder="Digite a Razão Social da Empresa"
                autoComplete="name"
                value={formData.razao_social}
                onChange={handleChange}
            />
            </>
        )}
        {supplierType === "fisica" && (
            <SmartField
                fieldName="nome_empresa_fornecedor"
                fieldText="Nome do Fornecedor"
                required
                type="text"
                placeholder="Digite o Nome do Fornecedor"
                autoComplete="name"
                value={formData.nome_empresa_fornecedor}
                onChange={handleChange}
            />
        )}

        <SmartField
            fieldName="email"
            fieldText="Email"
            required
            type="email"
            placeholder="Digite o email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
        />

        <div className="flex gap-7">
            <SmartField
                fieldName="tel"
                fieldText="Telefone"
                withInputMask
                unstyled
                required
                type="tel"
                mask="(99) 9999?9-9999"
                autoClear={false}
                pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                placeholder="(xx)xxxxx-xxxx"
                autoComplete="tel"
                value={formData.tel}
                onChange={handleChange}
                fieldClassname="flex flex-col flex-1"
            />
            <SmartField
                fieldName="cep"
                fieldText="CEP"
                withInputMask
                unstyled
                required
                type="text"
                mask="99999-999"
                autoClear={false}
                pattern="^\d{5}-\d{3}$"
                placeholder="Digite o CEP"
                autoComplete="postal-code"
                value={formData.cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
                fieldClassname="flex flex-col flex-1"
            />
        </div>

        <SmartField
            fieldName="endereco"
            fieldText="Endereço"
            fieldClassname="flex flex-col flex-1"
            required
            type="text"
            placeholder="Endereço Completo"
            value={formData.endereco}
            onChange={handleChange}
            autoComplete="street-address"
        />

        <div className="flex gap-7">
            <SmartField
                fieldName="num_endereco"
                fieldText="Número"
                required
                type="number"
                min={1}
                placeholder="Número"
                value={formData.num_endereco}
                onChange={handleChange}
                autoComplete="address-line1"
                inputWidth="w-[160px]"
            />
            <SmartField
                fieldName="complemento"
                fieldText="Complemento"
                fieldClassname="flex flex-col flex-1"
                type="text"
                placeholder="Complemento"
                value={formData.complemento}
                onChange={handleChange}
            />
        </div>
        <SmartField
            fieldName="estado"
            fieldText="Estado"
            isSelect
            isLoading={loading.has("ufs")}
            value={formData.estado}
            placeholder="Selecione"
            autoComplete="address-level1"
            error={errors.cities ? "*" : undefined}
            fieldClassname="flex flex-col flex-1"
            onChangeSelect={handleChange}
            isDisabled={!!formData.cep || !ufs}
            options={ufs?.map((uf: UF) => ({
                label: uf.nome,
                value: uf.sigla,
            }))}
            onBlur={() => {
                const uf = ufs?.find((uf: UF) => formData.estado === uf.sigla);
                handleCities(uf?.id);
            }}
        />
        <SmartField
            fieldName="cidade"
            fieldText="Cidade"
            isSelect
            isLoading={loading.has("cities")}
            value={formData.cidade}
            placeholder="Selecione"
            autoComplete="address-level2"
            error={errors.states ? "*" : undefined}
            fieldClassname="flex flex-col flex-1"
            onChangeSelect={handleChange}
            isDisabled={!!formData.cep || !cities}
            options={cities?.map((city: City) => ({
                label: city.nome,
                value: city.nome,
            }))}
        />
    </div>
  );
};

export default SupplierRegister;

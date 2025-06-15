import React from "react";
import { SmartField } from "../../../shared";
import { FormDataClient, SelectEvent, UF, City } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

type FieldErrors = {
  [key in
    | "states"
    | "cities"
    | "isCepValid"
  ]: boolean;
};

interface Props {
  formData: FormDataClient;
  loading: Set<string>;
  errors: FieldErrors;
  clientType: string;
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

const ClientRegister: React.FC<Props> = ({
  formData,
  loading,
  errors,
  ufs,
  cities,
  clientType,
  handleCities,
  handleCepBlur,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                fieldName="tipo"
                fieldText="Tipo"
                isClearable={false}
                isSelect
                value={formData.tipo}
                fieldClassname="flex flex-col flex-1"
                onChangeSelect={handleChange}
                options={[
                    { value: "juridica", label: "Pessoa Jurídica" },
                    { value: "fisica", label: "Pessoa Física" },
                ]}
            />
            {clientType === "juridica" && (
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
            {clientType === "fisica" && (
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

        {clientType === "juridica" && (
            <SmartField
                fieldName="nome_empresa_cliente"
                fieldText="Nome Fantasia da Empresa"
                required
                type="text"
                placeholder="Digite o nome Fantasia da empresa"
                autoComplete="name"
                value={formData.nome_empresa_cliente}
                onChange={handleChange}
            />
        )}

        {clientType === "juridica" && (
            <SmartField
                fieldName="razao_social"
                fieldText="Razão Social"
                fieldClassname="flex flex-col flex-1"
                required
                type="text"
                placeholder="Digite a Razão Social da Empresa"
                autoComplete="name"
                value={formData.razao_social}
                onChange={handleChange}
            />
        )}

        {clientType === "fisica" && (
            <SmartField
                fieldName="nome_empresa_cliente"
                fieldText="Nome do cliente"
                type="text"
                required
                placeholder="Digite o nome completo do Cliente"
                autoComplete="name"
                value={formData.nome_empresa_cliente}
                onChange={handleChange}
                fieldClassname="flex flex-col flex-1"
            />
        )}

        <SmartField
            fieldName="email"
            fieldText="Email"
            fieldClassname="flex flex-col flex-1"
            required
            type="email"
            placeholder="Digite o e-mail do cliente"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
        />

        <div className="flex flex-col lg:flex-row gap-4">
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
                placeholder="Digite o Telefone"
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
                error={errors.isCepValid ? "*" : undefined}
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
            required
            type="text"
            placeholder="Endereço Completo"
            value={formData.endereco}
            onChange={handleChange}
            autoComplete="street-address"
        />

        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                fieldName="num_endereco"
                fieldText="Número"
                required
                min={1}
                type="number"
                placeholder="Número"
                value={formData.num_endereco}
                onChange={handleChange}
                autoComplete="address-line1"
                inputWidth={`${window.innerWidth < 1024 ? "w-auto" : "w-[160px]"}`}
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
            error={errors.states ? "*" : undefined}
            fieldClassname="flex flex-col flex-1"
            onChangeSelect={handleChange}
            options={ufs?.map((uf: UF) => ({
                label: uf.nome,
                value: uf.sigla,
            }))}
            onBlur={() => {
                const uf = ufs?.find(
                    (uf: UF) => formData.estado === uf.sigla
                );

                handleCities(uf?.id);
            }}
            isDisabled={!!formData.cep}
        />

        <SmartField
            fieldName="cidade"
            fieldText="Cidade"
            isSelect
            isLoading={loading.has("cities")}
            value={formData.cidade}
            placeholder="Selecione"
            autoComplete="address-level2"
            error={errors.cities ? "*" : undefined}
            fieldClassname="flex flex-col flex-1"
            onChangeSelect={handleChange}
            options={cities?.map((city: City) => ({
                label: city.nome,
                value: city.nome,
            }))}
            isDisabled={!!formData.cep || !cities}
        />

        <SmartField
            isTextArea
            rows={2}
            fieldName="obs"
            fieldText="Observações"
            fieldClassname="flex flex-col w-full"
            placeholder="Digite as observações do cliente"
            value={formData.obs}
            onChange={handleChange}
        />
    </div>
  );
};

export default ClientRegister;

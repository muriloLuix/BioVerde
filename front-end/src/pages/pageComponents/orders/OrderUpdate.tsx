import React from "react";
import { SmartField } from "../../../shared";
import { FormDataOrders, SelectEvent, UF, City, OrderOptions } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

type FieldErrors = {
  [key in
    | "isCepValid"
  ]: boolean;
};

interface Props {
  formData: FormDataOrders;
  loading: Set<string>;
  options?: OrderOptions;
  ufs?: UF[];
  cities?: City[];
  errors: FieldErrors;
  handleCities: (id: number | undefined) => Promise<void>;
  handleCepBlur: () => void;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
      | SelectEvent
  ) => void;
}

const OrderUpdate: React.FC<Props> = ({
  formData,
  loading,
  ufs,
  cities,
  errors,
  options,
  handleCities,
  handleCepBlur,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                fieldName="num_pedido"
                fieldText="Nº Pedido"
                type="number"
                required
                isDisable
                placeholder="Nº Pedido"
                value={formData.pedido_id}
                onChange={handleChange}
                inputWidth={`${window.innerWidth < 1024 ? "w-auto" : "w-[100px]"}`}
            />

            <SmartField
                fieldName="nome_cliente"
                fieldText="Cliente"
                isSelect
                isClearable={false}
                isLoading={loading.has("options")}
                value={formData.nome_cliente}
                onChange={handleChange}
                placeholder="Selecione o cliente"
                fieldClassname="flex flex-col flex-1"
                onChangeSelect={handleChange}
                options={options?.clientes.map((cliente) => ({
                    label: cliente.cliente_nome,
                    value: String(cliente.cliente_id),
                }))}
            />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                type="date"
                required
                fieldName="prev_entrega"
                fieldText="Previsão de entrega"
                value={formData.prev_entrega}
                onChange={handleChange}
                fieldClassname="flex flex-col flex-1"
            />
            <SmartField
                fieldName="status"
                fieldText="Status do Pedido"
                isSelect
                isClearable={false}
                isLoading={loading.has("options")}
                value={formData.status}
                onChange={handleChange}
                placeholder="Selecione o Status"
                fieldClassname="flex flex-col flex-1"
                onChangeSelect={handleChange}
                options={options?.status.map((status) => ({
                    label: status.stapedido_nome,
                    value: String(status.stapedido_id),
                }))}
            />
        </div>
        
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
            fieldName="endereco"
            fieldText="Endereço"
            required
            type="text"
            placeholder="Endereço"
            value={formData.endereco}
            onChange={handleChange}
            autoComplete="street-address"
            fieldClassname="flex flex-col flex-1"
        />

        <SmartField
            fieldName="estado"
            fieldText="Estado"
            isSelect
            isLoading={loading.has("ufs")}
            value={formData.estado}
            placeholder="Selecione"
            autoComplete="address-level1"
            isClearable={false}
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
            isClearable={false}
            isLoading={loading.has("cities")}
            value={formData.cidade}
            placeholder="Selecione"
            autoComplete="address-level2"
            fieldClassname="flex flex-col flex-1"
            onChangeSelect={handleChange}
            isDisabled={!!formData.cep || !cities}
            options={cities?.map((city: City) => ({
                label: city.nome,
                value: city.nome,
            }))}
        />

        <div className="mb-5">
            <SmartField
                isTextArea
                fieldName="obs"
                fieldText="Observações"
                fieldClassname="flex flex-col w-full"
                placeholder="Digite as observações do pedido"
                value={formData.obs}
                onChange={handleChange}
                rows={2}
            />
        </div>
    </div>
  );
};

export default OrderUpdate;

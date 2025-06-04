import React from "react";
import { SmartField } from "../../../shared";
import { BatchOptions, FormDataBatch, SelectEvent } from "../../../utils/types";

type FieldErrors = {
  [key in
    | "product"
    | "supplier"
    | "unit"
    | "type"
    | "classification"
    | "price"
    | "storage"
    | "quantityMax"
    | "harvestDate"
    | "expirationDate"
  ]: boolean;
};

interface Props {
  formData: FormDataBatch;
  options?: BatchOptions;
  userLevel?: string;
  loading: Set<string>;
  errors: FieldErrors;
  openProductModal?: () => void;
  createProduct?: (produtoNome: string) => Promise<void>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
  handlePriceChange: (data: { value: string }) => void;
}

const BatchRegister: React.FC<Props> = ({
  formData,
  options,
  loading,
  errors,
  userLevel,
  createProduct,
  openProductModal,
  handleChange,
  handlePriceChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <SmartField
        fieldName="produto"
        fieldText="Produto"
        isSelect
        isCreatableSelect
        error={errors.product ? "*" : undefined}
        isLoading={loading.has("options")}
        value={formData.produto}
        placeholder="Selecione ou Digite um Novo Produto"
        creatableConfigName="Gerenciar Produtos"
        userLevel={userLevel}
        openManagementModal={openProductModal}
        onCreateNewOption={createProduct}
        onChangeSelect={handleChange}
        options={options?.produtos.map((produto) => ({
          label: produto.produto_nome,
          value: String(produto.produto_id),
        }))}
      />

      <SmartField
        fieldName="fornecedor"
        fieldText="Fornecedor"
        isSelect
        isLoading={loading.has("options")}
        error={errors.supplier ? "*" : undefined}
        value={formData.fornecedor}
        placeholder="Selecione o fornecedor"
        onChangeSelect={handleChange}
        options={options?.fornecedores.map((fornecedor) => ({
          label: fornecedor.fornecedor_nome,
          value: String(fornecedor.fornecedor_id),
        }))}
      />

      <div className="flex gap-10">
        <SmartField
          fieldName="quant_max"
          fieldText="Capacidade Máxima"
          error={errors.quantityMax ? "*" : undefined}
          fieldClassname="flex flex-col flex-1"
          min={1}
          type="number"
          value={formData.quant_max}
          onChange={handleChange}
          placeholder="Quantidade no lote"
        />
        <SmartField
          fieldName="unidade"
          fieldText="Unidade de Medida"
          isSelect
          fieldClassname="flex flex-col flex-1"
          isLoading={loading.has("options")}
          error={errors.unit ? "*" : undefined}
          value={formData.unidade}
          placeholder="Selecione"
          onChangeSelect={handleChange}
          options={options?.unidade_medida.map((unidade) => ({
            label: unidade.uni_nome,
            value: String(unidade.uni_id),
          }))}
        />
      </div>

      <div className="flex gap-10">
        <SmartField
          isPrice
          fieldName="preco"
          fieldText="Preço Unitário do Produto"
          fieldClassname="flex flex-col flex-1"
          type="text"
          placeholder="Preço do Produto"
          error={errors.price ? "*" : undefined}
          value={formData.preco}
          onValueChange={handlePriceChange}
        />
        <SmartField
          fieldName="tipo"
          fieldText="Tipo"
          isSelect
          isLoading={loading.has("options")}
          error={errors.type ? "*" : undefined}
          fieldClassname="flex flex-col flex-1"
          value={formData.tipo}
          placeholder="Selecione"
          onChangeSelect={handleChange}
          options={options?.tipos.map((tipo) => ({
            label: tipo.tproduto_nome,
            value: String(tipo.tproduto_id),
          }))}
        />
      </div>

      <div className="flex gap-10">
        <SmartField
          type="date"
          fieldName="dt_colheita"
          fieldText="Data de Colheita"
          error={errors.harvestDate ? "*" : undefined}
          value={formData.dt_colheita}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />
        <SmartField
          type="date"
          error={errors.expirationDate ? "*" : undefined}
          fieldName="dt_validade"
          fieldText="Data de Validade"
          value={formData.dt_validade}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />
      </div>

      <SmartField
        fieldName="classificacao"
        fieldText="Classificação"
        isSelect
        isLoading={loading.has("options")}
        error={errors.classification ? "*" : undefined}
        fieldClassname="flex flex-col flex-1"
        value={formData.classificacao}
        placeholder="Selecione"
        onChangeSelect={handleChange}
        options={options?.classificacoes.map((classificacao) => ({
          label: classificacao.classificacao_nome,
          value: String(classificacao.classificacao_id),
        }))}
      />

      <SmartField
        fieldName="localArmazenado"
        fieldText="Local de Armazenamento"
        isSelect
        isLoading={loading.has("options")}
        error={errors.storage ? "*" : undefined}
        value={formData.localArmazenado}
        placeholder="Selecione o local"
        onChangeSelect={handleChange}
        options={options?.locaisArmazenamento.map((locais) => ({
          label: locais.localArmazenamento_nome,
          value: String(locais.localArmazenamento_id),
        }))}
      />

      <SmartField
        fieldName="obs"
        fieldText="Observações"
        rows={2}
        isTextArea
        placeholder="Adicione informações sobre o lote"
        value={formData.obs}
        onChange={handleChange}
      />
    </div>
  );
};

export default BatchRegister;

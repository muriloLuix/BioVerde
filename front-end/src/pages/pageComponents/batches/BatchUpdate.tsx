/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { SmartField } from "../../../shared";
import { BatchOptions, FormDataBatch, SelectEvent } from "../../../utils/types";

interface Props {
  formData: FormDataBatch;
  options?: BatchOptions;
  customComponents: any;
  loading: Set<string>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
  handlePriceChange: (data: { value: string }) => void;
}

const BatchUpdate: React.FC<Props> = ({
  formData,
  options,
  loading,
  customComponents,
  handleChange,
  handlePriceChange,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-5">
        <SmartField
            fieldName="lote_codigo"
            fieldText="Código do lote"
            fieldClassname="flex flex-col flex-1"
            type="text"
            isDisable
            value={formData.lote_codigo}
            onChange={handleChange}
            readOnly
        />
        <SmartField
            fieldName="produto"
            fieldText="Produto"
            isSelect
            isDisabled
            components={customComponents}
            isClearable={false}
            placeholder="Selecione o produto"
            isLoading={loading.has("options")}
            value={formData.produto}
            onChangeSelect={handleChange}
            options={
                options?.produtos.map((produto) => ({
                    label: produto.produto_nome,
                    value: String(produto.produto_id),
                }))
            }
        />
        <SmartField
            fieldName="fornecedor"
            fieldText="Fornecedor"
            isSelect
            isLoading={loading.has("options")}
            isClearable={false}
            value={formData.fornecedor}
            placeholder="Selecione o fornecedor"
            onChangeSelect={handleChange}
            options={
                options?.fornecedores.map((fornecedor) => ({
                    label: fornecedor.fornecedor_nome,
                    value: String(fornecedor.fornecedor_id),
                }))
            }
        />
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                fieldName="quant_max"
                fieldText="Capacidade Máxima"
                required
                min={1}
                fieldClassname="flex flex-col flex-1"
                type="number"
                value={formData.quant_max}
                onChange={handleChange}
                placeholder="Quantidade Inicial"
            />
            <SmartField
                fieldName="unidade"
                fieldText="Unidade de Medida"
                isSelect
                fieldClassname="flex flex-col flex-1"
                isLoading={loading.has("options")}
                isClearable={false}
                value={formData.unidade}
                placeholder="Selecione"
                onChangeSelect={handleChange}
                options={
                    options?.unidade_medida.map((unidade) => ({
                        label: unidade.uni_nome,
                        value: String(unidade.uni_id),
                    }))
                }
            />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                isPrice
                fieldName="preco"
                fieldText="Preço Unitário do Produto"
                fieldClassname="flex flex-col flex-1"
                type="text"
                required
                placeholder="Preço do Produto"
                value={formData.preco}
                onValueChange={handlePriceChange}
            />
            <SmartField
                fieldName="tipo"
                fieldText="Tipo"
                isSelect
                isLoading={loading.has("options")}
                isClearable={false}
                fieldClassname="flex flex-col flex-1"
                value={formData.tipo}
                placeholder="Selecione"
                onChangeSelect={handleChange}
                options={
                    options?.tipos.map((tipo) => ({
                        label: tipo.tproduto_nome,
                        value: String(tipo.tproduto_id),
                    }))
                }
            />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
            <SmartField
                type="date"
                fieldName="dt_colheita"
                required
                fieldText="Data de Colheita"
                value={formData.dt_colheita}
                onChange={handleChange}
                fieldClassname="flex flex-col flex-1"
            />
            <SmartField
                type="date"
                required
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
            isClearable={false}
            fieldClassname="flex flex-col flex-1"
            value={formData.classificacao}
            placeholder="Selecione"
            onChangeSelect={handleChange}
            options={
                options?.classificacoes.map((classificacao) => ({
                    label: classificacao.classificacao_nome,
                    value: String(classificacao.classificacao_id),
                }))
            }
        />

        <SmartField
            fieldName="localArmazenado"
            fieldText="Local de Armazenamento"
            isSelect
            isLoading={loading.has("options")}
            isClearable={false}
            value={formData.localArmazenado}
            placeholder="Selecione o local"
            onChangeSelect={handleChange}
            options={
                options?.locaisArmazenamento.map((locais) => ({
                    label: locais.localArmazenamento_nome,
                    value: String(locais.localArmazenamento_id),
                }))
            }
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

export default BatchUpdate;

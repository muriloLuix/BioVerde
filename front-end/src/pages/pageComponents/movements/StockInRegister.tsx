import React from "react";
import { SmartField } from "../../../shared";
import { Movements, FormDataMovements, SelectEvent, Batch } from "../../../utils/types";

type FieldErrors = {
  [key in
    | "product"
    | "batch"
    | "quantity"
    | "destination"
    | "reason"
    | "order"
  ]: boolean;
};

interface Props {
  formData: FormDataMovements;
  options?: Movements;
  loading: Set<string>;
  errors: FieldErrors;
  BatchFilter: (lote: Batch) => boolean;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const stockInRegister: React.FC<Props> = ({
  formData,
  options,
  loading,
  errors,
  BatchFilter,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <SmartField
            fieldName="produto"
            fieldText="Produto"
            isSelect
            error={errors.product ? "*" : undefined}
            placeholder="Selecione o produto"
            isLoading={loading.has("options")}
            value={formData.produto}
            onChangeSelect={handleChange}
            options={options?.produtos.map((produto) => ({
                label: produto.produto_nome,
                value: String(produto.produto_id),
            }))}
        />

        <SmartField
            fieldName="lote"
            fieldText="Lote"
            isSelect
            isLoading={loading.has("options")}
            error={errors.batch ? "*" : undefined}
            value={formData.lote}
            noOptionsMessage={() => "Nenhum Lote encontrado com o Produto selecionado"}
            placeholder="Selecione o lote"
            onChangeSelect={handleChange}
            options={(options?.lotes.filter(BatchFilter) ?? []).map((lote: Batch) => ({
                label: lote.lote_codigo,
                value: String(lote.lote_id),
            }))}
        />

        <div className="flex gap-10">
            <SmartField
                fieldName="quantidade"
                fieldText="Quantidade"
                error={errors.quantity ? "*" : undefined}
                fieldClassname="flex flex-col flex-1"
                type="number"
                value={formData.quantidade}
                onChange={handleChange}
                placeholder="Quantidade"
            />
            {formData.lote && (
                <SmartField
                    fieldName="unidade"
                    fieldText="Unidade de Medida"
                    isDisable
                    inputWidth="w-[200px]"
                    placeholder="Unidade de Medida"
                    readOnly
                    value={
                        options?.unidade_medida.find(
                            (u) => String(u.uni_id) === formData.unidade
                        )?.uni_nome || ""
                    }
                />
            )}
        </div>

        <SmartField
            fieldName="motivo"
            fieldText="Motivo da Entrada"
            isSelect
            fieldClassname="flex flex-col flex-1"
            isLoading={loading.has("options")}
            error={errors.reason ? "*" : undefined}
            value={formData.motivo}
            placeholder="Selecione o Motivo"
            onChangeSelect={handleChange}
            options={options?.motivos
                .filter((motivo) => motivo.mov_tipo === "entrada")
                .map((motivo) => ({
                    label: motivo.motivo,
                    value: String(motivo.motivo_id),
                }))
            }
        />

        <SmartField
            fieldName="obs"
            fieldText="Observações"
            rows={2}
            isTextArea
            placeholder="Adicione informações sobre a entrada do produto"
            value={formData.obs}
            onChange={handleChange}
        />
    </div>   
  );
};

export default stockInRegister;

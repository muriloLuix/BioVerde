/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { SmartField } from "../../../shared";
import { StepOptions, SelectEvent, ProductsWithSteps, DeleteSteps } from "../../../utils/types";

interface Props {
  deleteStep: DeleteSteps;
  selectedProduct: ProductsWithSteps | null;
  customComponents: any;
  options?: StepOptions;
  loading: Set<string>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const DeleteStep: React.FC<Props> = ({
  deleteStep,
  selectedProduct,
  customComponents,
  options,
  loading,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-5">
        <SmartField
            fieldName="produto_nome"
            fieldText="Produto Final"
            fieldClassname="flex flex-col flex-1"
            required
            type="text"
            value={selectedProduct?.produto_nome}
            onChange={handleChange}
            readOnly
        />
        <SmartField
            fieldName="dstep"
            fieldText="Nome da Etapa a ser excluída"
            isSelect
            isClearable={false}
            menuIsOpen={false}
            isSearchable={false}
            components={customComponents}
            fieldClassname="flex flex-col flex-1"
            isLoading={loading.has("options")}
            value={deleteStep.dstep}
            onChangeSelect={handleChange}
            options={options?.nome_etapas.map((etapa) => ({
                label: etapa.etapa_nome,
                value: String(etapa.etapa_nome_id),
            }))}
        />
        <SmartField
            isTextArea
            fieldName="reason"
            required
            autoFocus
            fieldText="Motivo da Exclusão"
            fieldClassname="flex flex-col w-full"
            placeholder="Digite o motivo da exclusão da Etapa"
            value={deleteStep.reason}
            onChange={handleChange}
        />
    </div>
  );
};

export default DeleteStep;

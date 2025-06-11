import React from "react";
import { SmartField } from "../../../shared";
import { StepOptions, SelectEvent, ProductsWithSteps, FormDataSteps } from "../../../utils/types";

type FieldErrors = {
  [key in
    | "step"
    | "time"
    | "unit"
	| "insoum"
  ]: boolean;
};

interface Props {
  formData: FormDataSteps;
  selectedProduct: ProductsWithSteps | null;
  options?: StepOptions;
  userLevel?: string;
  loading: Set<string>;
  errors: FieldErrors;
  openStepNameModal?: () => void;
  createStepName?: (stepName: string) => Promise<void>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const NewStep: React.FC<Props> = ({
  formData,
  selectedProduct,
  options,
  loading,
  errors,
  userLevel,
  openStepNameModal,
  createStepName,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <SmartField
            fieldName="produto_nome"
            fieldText="Produto Final"
            fieldClassname="flex flex-col flex-1"
            type="text"
            value={selectedProduct?.produto_nome}
            onChange={handleChange}
            readOnly
        />
        <SmartField
            fieldName="etapa_nome_id"
            fieldText="Nome da Etapa"
            isSelect
            isCreatableSelect
            fieldClassname="flex flex-col flex-1"
            isLoading={loading.has("options")}
            error={errors.step ? "*" : undefined}
            value={formData.etapa_nome_id}
            userLevel={userLevel}
            onCreateNewOption={createStepName}
            openManagementModal={openStepNameModal}
            creatableConfigName="Gerenciar Nome de Etapas"
            placeholder="Digite o Nome da Etapa"
            onChangeSelect={handleChange}
            options={options?.nome_etapas.map((etapa) => ({
                label: etapa.etapa_nome,
                value: String(etapa.etapa_nome_id),
            }))}
        />
        <div className="flex gap-10">
            <SmartField
                fieldName="etor_tempo"
                fieldText="Tempo Estimado"
                type="text"
                error={errors.time ? "*" : undefined}
                fieldClassname="flex flex-col flex-1"
                placeholder="Tempo Estimado da etapa"
                value={formData.etor_tempo}
                onChange={handleChange}
                pattern="^([0-9]{1,4}|[0-9]{1,2}:[0-5][0-9](?::[0-5][0-9])?)$"
            />

            <SmartField
                fieldName="etor_unidade"
                fieldText="Unidade de Medida"
                isSelect
                fieldClassname="flex flex-col flex-1"
                isLoading={loading.has("options")}
                error={errors.unit ? "*" : undefined}
                value={formData.etor_unidade}
                placeholder="Selecione"
                onChangeSelect={handleChange}
                options={[
                    { value: 's', label: 'Segundo' },
                    { value: 'min', label: 'Minutos' },
                    { value: 'h', label: 'Hora ' },
                    { value: ' Dia(s)', label: 'Dia' },
                    { value: ' Mês(es)', label: 'Mês' },
                    { value: ' Ano(s)', label: 'Ano' },
                ]}
            />
        </div>
        <SmartField
            fieldName="etor_insumos"
            fieldText="Insumos Utilizados"
            isSelect
            fieldClassname="flex flex-col flex-1"
            isLoading={loading.has("options")}
            isMulti
            error={errors.insoum ? "*" : undefined}
            value={formData.etor_insumos}
            placeholder="Selecione os Insumos dessa etapa"
            onChangeSelect={handleChange}
            options={options?.produtos.map((produto) => ({
                label: produto.produto_nome,
                value: produto.produto_nome,
            }))}
        />
        <SmartField
            isTextArea
            fieldName="etor_observacoes"
            fieldText="Observações"
            fieldClassname="flex flex-col flex-1"
            placeholder="Digite as observações da Etapa"
            value={formData.etor_observacoes}
            onChange={handleChange}
            rows={2}
        />
    </div>
  );
};

export default NewStep;

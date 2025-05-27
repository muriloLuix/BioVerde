import React from "react";
import { SmartField } from "../../../shared";
import { DeleteBatch } from "../../../utils/types";

interface Props {
  deleteBatch: DeleteBatch;
  loading: Set<string>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const BatchDelete: React.FC<Props> = ({
  deleteBatch,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-5">
        <SmartField
            fieldName="lote_codigo"
            fieldText="Código do lote"
            fieldClassname="flex flex-col flex-1"
            required
            type="text"
            value={deleteBatch.lote_codigo}
            onChange={handleChange}
            readOnly
        />

        <SmartField
            fieldName="dproduto"
            fieldText="Produto"
            fieldClassname="flex flex-col w-full"
            type="text"
            autoComplete="name"
            required
            readOnly
            value={deleteBatch.dproduto}
            onChange={handleChange}
        />
        <SmartField
            isTextArea
            fieldName="reason"
            required
            autoFocus
            fieldText="Motivo da Exclusão"
            fieldClassname="flex flex-col w-full"
            placeholder="Digite o motivo da exclusão do lote"
            value={deleteBatch.reason}
            onChange={handleChange}
        />
    </div>
  );
};

export default BatchDelete;

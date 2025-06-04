import React from "react";
import { SmartField } from "../../../shared";
import { DeleteSupplier, SelectEvent } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

interface Props {
  deleteSupplier: DeleteSupplier;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
      | SelectEvent
  ) => void;
}

const SupplierDelete: React.FC<Props> = ({
  deleteSupplier,
  handleChange,
}) => {
  return (
    <>
    <div className="flex mb-7">
        <SmartField
            fieldName="dnome_empresa"
            fieldText="Nome da Empresa"
            fieldClassname="flex flex-col w-full"
            type="text"
            required
            readOnly
            value={deleteSupplier.dnome_empresa}
            onChange={handleChange}
        />
    </div>

    <div className="flex mb-7">
        <SmartField
            isTextArea
            fieldName="reason"
            required
            autoFocus
            fieldText="Motivo da Exclusão"
            fieldClassname="flex flex-col w-full"
            placeholder="Digite o motivo da exclusão do fornecedor"
            value={deleteSupplier.reason}
            onChange={handleChange}
        />
    </div>
    </>
  );
};

export default SupplierDelete;

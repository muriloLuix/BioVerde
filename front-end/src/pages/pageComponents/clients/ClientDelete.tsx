import React from "react";
import { SmartField } from "../../../shared";
import { DeleteClient, SelectEvent } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

interface Props {
  deleteClient: DeleteClient;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
      | SelectEvent
  ) => void;
}

const ClientDelete: React.FC<Props> = ({
  deleteClient,
  handleChange,
}) => {
  return (
    <>
    <div className="flex mb-7">
        <SmartField
            fieldName="dnome_cliente"
            fieldText="Nome do Cliente"
            fieldClassname="flex flex-col w-full"
            type="text"
            autoComplete="name"
            required
            readOnly
            value={deleteClient.dnome_cliente}
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
            placeholder="Digite o motivo da exclusão do cliente"
            value={deleteClient.reason}
            onChange={handleChange}
        />
    </div>
    </>
  );
};

export default ClientDelete;

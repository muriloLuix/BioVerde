import React from "react";
import { SmartField } from "../../../shared";
import { DeleteOrders, SelectEvent } from "../../../utils/types";
import { InputMaskChangeEvent } from "primereact/inputmask";

interface Props {
  deleteOrder: DeleteOrders;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
      | SelectEvent
  ) => void;
}

const OrderDelete: React.FC<Props> = ({
  deleteOrder,
  handleChange,
}) => {
  return (
    <>
    <div className="flex mb-4">
        <SmartField
            fieldName="dnum_pedido"
            fieldText="Nº do Pedido"
            fieldClassname="flex flex-col w-full"
            type="text"
            required
            readOnly
            value={deleteOrder.dnum_pedido}
            onChange={handleChange}
        />
    </div>

    <div className="flex mb-4">
        <SmartField
            fieldName="dnome_cliente"
            fieldText="Nome do Cliente"
            fieldClassname="flex flex-col w-full"
            type="text"
            required
            readOnly
            value={deleteOrder.dnome_cliente}
            onChange={handleChange}
        />
    </div>

    <div className="flex mb-4">
        <SmartField
            isTextArea
            fieldName="reason"
            required
            autoFocus
            fieldText="Motivo da Exclusão"
            fieldClassname="flex flex-col w-full"
            placeholder="Digite o motivo da exclusão do pedido"
            value={deleteOrder.reason}
            onChange={handleChange}
        />
    </div>
    </>
  );
};

export default OrderDelete;

import React from "react";
import { SmartField } from "../../../shared";
import { DeleteUser, SelectEvent } from "../../../utils/types";

interface Props {
  deleteUser: DeleteUser;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const UserDelete: React.FC<Props> = ({
  deleteUser,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-7">
        <div className="flex">
            <SmartField
                fieldName="dname"
                fieldText="Nome Completo"
                fieldClassname="flex flex-col w-full"
                type="text"
                autoComplete="name"
                required
                readOnly
                value={deleteUser.dname}
                onChange={handleChange}
            />
        </div>
        <div className="flex mb-7 ">
            <SmartField
                isTextArea
                fieldName="reason"
                required
                autoFocus
                fieldText="Motivo da Exclusão"
                fieldClassname="flex flex-col w-full"
                placeholder="Digite o motivo da exclusão do usuário"
                value={deleteUser.reason}
                onChange={handleChange}
            />
        </div>
    </div>
  );
};

export default UserDelete;

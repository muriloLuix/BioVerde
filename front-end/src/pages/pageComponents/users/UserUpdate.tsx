import React from "react";
import { SmartField } from "../../../shared";
import { UserOptions, FormDataUser, SelectEvent } from "../../../utils/types";

interface Props {
  formData: FormDataUser;
  options?: UserOptions;
  loading: Set<string>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const UserUpdate: React.FC<Props> = ({
  formData,
  options,
  loading,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-6 w-2xl">
      <div className="flex gap-7 justify-between">
        <SmartField
          fieldName="name"
          fieldText="Nome Completo"
          required
          type="text"
          placeholder="Digite o nome completo"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />

        <SmartField
          fieldName="email"
          fieldText="Email"
          required
          type="email"
          placeholder="Digite o email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />
      </div>

      <div className="flex gap-7 justify-between">
        <SmartField
          fieldName="tel"
          fieldText="Telefone"
          withInputMask
          required
          type="tel"
          mask="(99) 9999?9-9999"
          autoClear={false}
          unstyled
          pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
          placeholder="Digite o Telefone"
          autoComplete="tel"
          value={formData.tel}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />

        <SmartField
          fieldName="cpf"
          fieldText="CPF"
          withInputMask
          required
          type="text"
          mask="999.999.999-99"
          autoClear={false}
          unstyled
          pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
          placeholder="Digite o CPF"
          value={formData.cpf}
          onChange={handleChange}
          fieldClassname="flex flex-col flex-1"
        />

        <SmartField
          fieldName="status"
          fieldText="Status"
          isSelect
          isClearable={false}
          isLoading={loading.has("options")}
          value={formData.status}
          placeholder="Selecione o Status"
          fieldClassname="flex flex-col flex-1"
          onChangeSelect={handleChange}
          options={[
            { value: "1", label: "Ativo" },
            { value: "0", label: "Inativo" },
          ]}
        />
      </div>

      <div className="flex gap-7 mb-7 justify-between">
        <SmartField
          fieldName="cargo"
          fieldText="Cargo"
          isSelect
          isClearable={false}
          isLoading={loading.has("options")}
          value={formData.cargo}
          onChange={handleChange}
          placeholder="Selecione o Cargo"
          fieldClassname="flex flex-col flex-1"
          onChangeSelect={handleChange}
          options={options?.cargos.map((cargo) => ({
            label: cargo.car_nome,
            value: cargo.car_nome,
          }))}
        />

        <SmartField
          fieldName="nivel"
          fieldText="Nível de Acesso"
          isSelect
          isClearable={false}
          isLoading={loading.has("options")}
          value={formData.nivel}
          onChange={handleChange}
          placeholder="Selecione o Nível"
          fieldClassname="flex flex-col flex-1"
          onChangeSelect={handleChange}
          options={options?.niveis.map((nivel) => ({
            label: nivel.nivel_nome,
            value: nivel.nivel_nome,
          }))}
        />
      </div>
    </div>
  );
};

export default UserUpdate;

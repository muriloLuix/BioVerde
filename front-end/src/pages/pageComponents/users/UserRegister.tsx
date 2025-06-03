import React from "react";
import { SmartField } from "../../../shared";
import { UserOptions, FormDataUser, SelectEvent } from "../../../utils/types";

type FieldErrors = {
  [key in
    | "position"
    | "level"
    | "password"
  ]: boolean;
};

interface Props {
  formData: FormDataUser;
  options?: UserOptions;
  userLevel?: string;
  loading: Set<string>;
  errors: FieldErrors;
  generatePassword?: () => void;
  openPositionModal?: () => void;
  createPosition?: (produtoNome: string) => Promise<void>;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const UserRegister: React.FC<Props> = ({
  formData,
  options,
  loading,
  errors,
  userLevel,
  openPositionModal,
  createPosition,
  generatePassword,
  handleChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
        <SmartField
            fieldName="name"
            fieldText="Nome Completo"
            placeholder="Digite o nome completo"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
        />
        <SmartField
            fieldName="email"
            fieldText="Email"
            type="email"
            placeholder="Digite o email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
        />

        <div className="flex gap-7">
            <SmartField
                fieldName="tel"
                fieldText="Telefone"
                fieldClassname="flex flex-col flex-1"
                withInputMask
                type="tel"
                mask="(99) 9999?9-9999"
                autoClear={false}
                unstyled
                pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                required
                autoComplete="tel"
                placeholder="Digite o Telefone"
                value={formData.tel}
                onChange={handleChange}
            />
            <SmartField
                fieldName="cpf"
                fieldText="CPF"
                fieldClassname="flex flex-col flex-1"
                withInputMask
                type="text"
                mask="999.999.999-99"
                autoClear={false}
                unstyled
                pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                required
                placeholder="Digite o CPF"
                value={formData.cpf}
                onChange={handleChange}
                inputWidth="w-full"
            />
        </div>

        <div className="flex gap-7">
            <SmartField
                fieldName="cargo"
                fieldText="Cargo"
                isSelect
                isCreatableSelect={
                    userLevel === "Administrador" ? true : false
                }
                error={errors.position ? "*" : undefined}
                isLoading={loading.has("options")}
                value={formData.cargo}
                placeholder="Selecione o Cargo"
                creatableConfigName="Gerenciar Cargos"
                fieldClassname="flex flex-col flex-1"
                userLevel={userLevel}
                openManagementModal={openPositionModal}
                onCreateNewOption={createPosition}
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
                error={errors.level ? "*" : undefined}
                isLoading={loading.has("options")}
                value={formData.nivel}
                placeholder="Selecione o nível de acesso"
                fieldClassname="flex flex-col flex-1"
                onChangeSelect={handleChange}
                options={options?.niveis.map((nivel) => ({
                    label: nivel.nivel_nome,
                    value: nivel.nivel_nome,
                }))}
            />
        </div>
        <SmartField
            isPassword
            fieldName="password"
            fieldText="Senha"
            placeholder="Digite ou Gere a senha"
            error={errors.password ? "A senha deve ter pelo menos 8 caracteres*" : undefined}
            value={formData.password}
            onChange={handleChange}
            generatePassword={generatePassword}
            inputWidth="w-full"
        />
    </div>
  );
};

export default UserRegister;

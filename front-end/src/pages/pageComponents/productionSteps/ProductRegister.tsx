import React from "react";
import { SmartField } from "../../../shared";
import { StepOptions, SelectEvent } from "../../../utils/types";

type FieldErrors = {
  [key in
    | "product"
  ]: boolean;
};

interface Props {
  newProduct: { produto: string };
  options?: StepOptions;
  loading: Set<string>;
  errors: FieldErrors;
  handleChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectEvent
  ) => void;
}

const ProductRegister: React.FC<Props> = ({
  newProduct,
  options,
  loading,
  errors,
  handleChange,
}) => {
  return (
    <SmartField
      fieldName="produto"
      fieldText="Produto"
      isSelect
      fieldClassname="flex flex-col flex-1"
      error={errors.product ? "*" : undefined}
      isLoading={loading.has("options")}
      value={newProduct.produto}
      placeholder="Selecione o novo Produto"
      onChangeSelect={handleChange}
      options={options?.produtos.map((produto) => ({
        label: produto.produto_nome,
        value: String(produto.produto_id),
      }))}
    />
  );
};

export default ProductRegister;

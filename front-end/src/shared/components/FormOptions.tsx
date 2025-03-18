import { Link } from "react-router-dom";

import Remember, { RememberProps } from "./Remember";

const FormOptions = ({ handleCheckbox }: RememberProps) => {
  return (
    <>
      <Remember handleCheckbox={handleCheckbox} />
      <Link
        to="/recuperar-senha"
        className="font-[open_sans] text-sm text-gray hover:underline italic"
      >
        Esqueci minha senha
      </Link>
    </>
  );
};

export default FormOptions;

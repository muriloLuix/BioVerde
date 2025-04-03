import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';

type CpfProps = {
    setCpf: (e: InputMaskChangeEvent) => void;
    cpfValue: string;
    required?: boolean;
  };

const Cpf = ({cpfValue, setCpf, required, ...rest }: CpfProps) => {
  
  return (
    <InputMask
      type="text"
      name="cpf"
      id="cpf"
      placeholder="xxx.xxx.xxx-xx"
      mask="999.999.999-99"
      autoClear={false}
      pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
      className="bg-white border w-[275px] border-separator rounded-lg p-2.5 shadow-xl"
      {...rest}
      required={required} 
      value={cpfValue}
      onChange={setCpf}
    />
  );
};

export default Cpf;

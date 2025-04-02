import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';

type PhoneProps = {
    setPhone: (e: InputMaskChangeEvent) => void;
    phoneValue: string;
    required?: boolean;
  };

const Phone = ({phoneValue, setPhone, required, ...rest }: PhoneProps) => {
  
  return (
    <InputMask
      type="tel"
      name="tel"
      id="tel"
      placeholder="(xx)xxxxx-xxxx"
      mask="(99) 9999?9-9999"
      autoClear={false}
      pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
      autoComplete="tel"
      className="bg-white border w-[275px] border-separator rounded-lg p-2.5 shadow-xl"
      {...rest}
      required={required} 
      value={phoneValue}
      onChange={setPhone}
    />
  );
};

export default Phone;

type EmailProps = React.InputHTMLAttributes<HTMLInputElement> & { };

const Email = ({ ...rest }: EmailProps) => {
  
  return (
      <input
          type="email"
          id="email"
          name="email"
          placeholder="E-mail"
          className="text-black bg-brancoSal p-2 w-full rounded outline-hidden"
          {...rest}
      />
  );
};

export default Email;

type EmailProps = React.InputHTMLAttributes<HTMLInputElement> & { };

const Email = ({ ...rest }: EmailProps) => {
  
  return (
      <input
          type="email"
          id="email"
          name="email"
          placeholder="E-mail"
          required
          {...rest}
          className="text-black bg-brancoSal p-2 w-full rounded outline-hidden"
      />
  );
};

export default Email;

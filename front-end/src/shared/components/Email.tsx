type EmailProps = {
    emailValue: string;
    emailId: string;
    emailPlaceholder: string;
    emailInputRef?: React.RefObject<HTMLInputElement | null>;
    emailFunction: React.ChangeEventHandler<HTMLInputElement> | undefined;
};

const Email = ({
    emailValue,
    emailInputRef,
    emailId,
    emailPlaceholder,
    emailFunction,
}: EmailProps) => {

  return (
    <input
        type="email"
        id={emailId}
        ref={emailInputRef}
        placeholder={emailPlaceholder}
        value={emailValue}
        onChange={emailFunction}
        className={`text-black bg-brancoSal p-2 w-full rounded outline-hidden`}
        required
    />
  );
};

export default Email;

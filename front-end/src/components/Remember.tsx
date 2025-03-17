import { CheckIcon } from "lucide-react";
import { Checkbox } from "radix-ui";

export type RememberProps = {
  handleCheckbox: () => void;
};

const Remember = ({ handleCheckbox }: RememberProps) => {
  return (
    <div className="flex ">
      <Checkbox.Root
        className="bg-white size-4 rounded m-auto mr-1"
        onCheckedChange={handleCheckbox}
        name="remember"
      >
        <Checkbox.Indicator asChild className="text-black size-4 flex gap-1">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span className="text-white">Lembrar</span>
    </div>
  );
};

export default Remember;

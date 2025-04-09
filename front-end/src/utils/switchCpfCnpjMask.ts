export function switchCpfCnpjMask(
    name: string,
    value: string | null | undefined,
    setCpfCnpjMask: (mask: string) => void
  ) {
    if (name !== "cnpj") return;
  
    const onlyDigits = (value ?? "").replace(/\D/g, "");
  
    const newMask =
      onlyDigits.length < 11
        ? "999.999.999-99" // CPF
        : "99.999.999/9999-99"; // CNPJ
  
    setCpfCnpjMask(newMask);
  
    if (onlyDigits.length === 11) {
      setTimeout(() => {
        const inputElement = document.querySelector<HTMLInputElement>('input[name="cnpj"]');
        if (inputElement) {
          const pos = inputElement.value.length - 4;
          inputElement.setSelectionRange(pos, pos);
        }
      }, 0);
    }
  }
  
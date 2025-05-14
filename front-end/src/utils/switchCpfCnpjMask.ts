export function switchCpfCnpjMask(
  name: string,
  value: string | null | undefined,
  setCpfCnpjMask: (mask: string) => void
) {
  if (
    name !== "fcnpj" &&
    name !== "fcpf_cnpj" 
  )
    return;

  const onlyDigits = (value ?? "").replace(/\D/g, "");

  const newMask =
    onlyDigits.length > 11
      ? "99.999.999/9999-99" // CNPJ
      : "999.999.999-99?9"; // CPF

  setCpfCnpjMask(newMask);

  if (onlyDigits.length === 12) {
    setTimeout(() => {
      const inputElements = document.querySelectorAll<HTMLInputElement>(
        'input[name="cnpj"], input[name="fcnpj"], input[name="fcpf_cnpj"], input[name="cpf_cnpj"]'
      );

      inputElements.forEach((inputElement) => {
        const pos = inputElement.value.length - 2;
        inputElement.setSelectionRange(pos, pos);
      });
    }, 0);
  }
}


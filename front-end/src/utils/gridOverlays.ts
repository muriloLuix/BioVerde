export const overlayLoadingTemplate = `
  <div class=" flex flex-col items-center justify-center gap-3 text-zinc-700 dark:text-zinc-200">
    <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    <span class="text-lg text-black font-medium">Carregando dados...</span>
  </div>
`;

export const overlayNoRowsTemplate = `
    <span class="text-lg text-gray-800 font-medium">Nenhum registro encontrado</span>
`;

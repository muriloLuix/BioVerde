import { useEffect, useRef } from 'react';

function useVerificarNivelAcesso() {
  const nivelAcessoAtual = useRef<number | null>(null);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      try {
        const response = await fetch('http://localhost/BioVerde/back-end/auth/check_authorization.php');
        const data = await response.json();
        
        if (!data.success) {
        //   window.location.reload();
          return;
        }

        if (nivelAcessoAtual.current === null) {
          nivelAcessoAtual.current = data.nivel_acesso;
        } else if (nivelAcessoAtual.current !== data.nivel_acesso) {
          // O nível mudou
          window.location.reload(); // ou navegue para uma tela apropriada
        }
      } catch (error) {
        console.error("Erro ao verificar nível de acesso", error);
      }
    }, 5000); // verifica a cada 5 segundos

    return () => clearInterval(intervalo);
  }, []);
}

export default useVerificarNivelAcesso;

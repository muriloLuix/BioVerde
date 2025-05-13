<?php 
class Acoes {

    /*************************** LOGIN *******************************/ 
    const LOGIN               = 1;
    const NOVA_SENHA          = 2;
    const RECUPERAR_SENHA     = 3;
    const REENVIAR_CODIGO     = 4;
    const VERIFICAR_CODIGO    = 5;
    const LOGOUT = 8;

    /*************************** PRODUTO *******************************/ 
    const EXCLUIR_PRODUTO    = 7;
    const CADASTRAR_PRODUTO = 18;
    const EDITAR_PRODUTO = 19;

    /*************************** USUÁRIOS *******************************/ 
    const CADASTRAR_USUARIO   = 6;
    const EDITAR_USUARIO      = 20;
    const EXCLUIR_USUARIO = 21;

    /*************************** CLIENTES *******************************/ 
    const CADASTRAR_CLIENTE = 9;
    const EDITAR_CLIENTE = 10;
    const EXCLUIR_CLIENTE = 11;

    /*************************** ETAPAS *******************************/ 

    const CADASTRAR_ETAPA = 12;
    const EDITAR_ETAPA = 13;
    const EXCLUIR_ETAPA = 14;

    /*************************** FORNECEDORES *******************************/ 

    const CADASTRAR_FORNECEDOR = 15;
    const EDITAR_FORNECEDOR = 16;
    const EXCLUIR_FORNECEDOR = 17;

    /*************************** PEDIDOS *******************************/

    const EXCLUIR_PEDIDO = 22;

}

?>
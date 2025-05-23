export interface Product {
	produto_id: number;
	produto_nome: string;
	tproduto_nome: string;
	produto_preco: string;
	lote_nome: number;
	lote_id: number;
	fornecedor_nome_ou_empresa: string;
	produto_observacoes: string;
	staproduto_nome: string;
}

export interface Client {
	cliente_id: number;
	cliente_nome_ou_empresa: string;
	cliente_razao_social: string;
	cliente_email: string;
	cliente_telefone: string;
	cliente_tipo: string;
	cliente_cpf_ou_cnpj: string;
	cliente_cep: string;
	cliente_endereco: string;
	cliente_numendereco: string;
	cliente_estado: string;
	cliente_cidade: string;
	cliente_observacoes: string;
	cliente_data_cadastro: string;
	cliente_complemento: string;
	estaAtivo: number;
}

export interface Supplier {
	fornecedor_id: number;
	fornecedor_nome_ou_empresa: string;
	fornecedor_razao_social: string;
	fornecedor_email: string;
	fornecedor_telefone: string;
	fornecedor_tipo: string;
	fornecedor_cpf_ou_cnpj: string;
	fornecedor_endereco: string;
	fornecedor_num_endereco: string;
	fornecedor_cidade: string;
	fornecedor_estado: string;
	fornecedor_cep: string;
	fornecedor_responsavel: string;
	fornecedor_dtcadastro: string;
	fornecedor_complemento: string;
	estaAtivo: number;
}

export interface User {
	user_id: number;
	user_nome: string;
	user_email: string;
	user_telefone: string;
	user_CPF: string;
	car_nome: string;
	nivel_nome: string;
	user_dtcadastro: string;
	estaAtivo: number;
}

export interface Batch {
	lote_id: number;
    lote_dtFabricacao: Date;
    lote_dtExpiracao: Date;
    lote_quantidade: string;
	fornecedor_nome_ou_empresa: string;
	tproduto_nome: string;
	staproduto_nome: string;
    lote_obs: string;
    produto_nome: string;
    uni_sigla: string;
	lote_classificacao: string;
    lote_localArmazenado: string;
}

export interface JobPosition {
	car_id: number;
	car_nome: string;
}

export interface Unit {
	uni_id: number;
	uni_nome: string;
	uni_sigla: string;
}

export interface AccessLevel {
	nivel_id: number;
	nivel_nome: string;
}

export interface ProductType {
	tproduto_id: number;
	tproduto_nome: string;
}

export interface ProductStatus {
	staproduto_id: number;
	staproduto_nome: string;
}

export interface OrderStatus {
	stapedido_id: number;
	stapedido_nome: string;
}

export interface PositionType {
	car_id: number;
	car_nome: string;
}

export interface Option {
	value: string;
	label: string;
}

export interface SelectEvent {
  target: {
    name: string;
    value: string;
  };
};



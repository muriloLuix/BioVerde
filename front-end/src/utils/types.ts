export interface SelectEvent {
	target: {
		name: string;
		value: string | string[];
	};
}

export interface Product {
	produto_id: number;
	produto_nome: string;
	tproduto_nome: string;
	produto_preco: string;
	lote_nome: number;
	lote_id: number;
	fornecedor_nome: string;
	produto_observacoes: string;
	staproduto_nome: string;
}

export interface Client {
	cliente_id: number;
	cliente_nome: string;
	cliente_razao_social: string;
	cliente_email: string;
	cliente_telefone: string;
	cliente_tipo: string;
	cliente_documento: string;
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
	fornecedor_nome: string;
	fornecedor_razao_social: string;
	fornecedor_email: string;
	fornecedor_telefone: string;
	fornecedor_tipo: string;
	fornecedor_documento: string;
	fornecedor_endereco: string;
	fornecedor_num_endereco: number;
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
    lote_codigo: string;
    lote_dtColheita: string;
    lote_dtValidade: string;
    lote_quantMax: number;
    lote_quantAtual: number;
    lote_obs: string;
	produto_preco: number;

    produto_id: number;
    produto_nome: string;

    fornecedor_id: number;
    fornecedor_nome: string;

    uni_id: number;
    uni_sigla: string;

    tproduto_id: number;
    tproduto_nome: string;

    classificacao_id: number;
    classificacao_nome: string;

    localArmazenamento_id: number;
    localArmazenamento_nome: string;
}

export interface JobPosition {
	car_id: number;
	car_nome: string;
}

export interface Storage {
	localArmazenamento_id: number;
	localArmazenamento_nome: string;
}

export interface Classification {
	classificacao_id: number;
	classificacao_nome: string;
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

export interface OrderType {
	pedido_id: number;
}

export interface OrderStatus {
	stapedido_id: number;
	stapedido_nome: string;
}

export interface PositionType {
	car_id: number;
	car_nome: string;
}

export interface ReasenType {
	motivo_id: number;
	mov_tipo: string;
	motivo: string;
}

export interface Option {
	value: string;
	label: string;
}

export interface UF {
	id: number;
	sigla: string;
	nome: string;
}
export interface City {
	id: number;
	nome: string;
}
export interface Logs {
	log_id: number;
	log_user_nome: string;
	log_datahora: string;
	log_pag_id: string;
	log_url: string;
	log_acao: string;
	log_conteudo: string;
}

export interface BatchOptions {
	produtos: Product[];
	unidade_medida: Unit[];
	tipos: ProductType[];
	fornecedores: Supplier[];
	classificacoes: Classification[];
	locaisArmazenamento: Storage[];
}

export interface Movements {
	produtos: Product[];
	unidade_medida: Unit[];
	lotes: Batch[];
	motivos: ReasenType[];
	pedidos: OrderType[];
}

export interface ProductsWithSteps {
	produto_id: number;
	produto_nome: string;
	etapas: Steps[];
};

export interface Steps extends Omit<FormDataSteps, "produto_nome" | "produto_id"> {
	producao_id: number;
	etor_dtCadastro?: string;
}

export interface StepNames {
	etapa_nome_id: number;
	etapa_nome: string;
}

export interface StepOptions {
	produtos: Product[];
	nome_etapas: StepNames[];
}




// ------ FormsData ------

export interface FormDataBatch {
  lote_id: number;
  lote_codigo: string;
  produto: string;
  fornecedor: string;
  dt_colheita: string;
  quant_max: number;
  quant_atual: number;
  unidade: string;
  preco: number;
  tipo: string;
  dt_validade: string;
  classificacao: string;
  localArmazenado: string;
  obs: string;
}

export interface FormDataMovements {
  produto: string;
  motivo: string;
  lote: string;
  quantidade: number;
  unidade: string;
  pedido: string;
  destino: string;
  obs: string;
}

export interface FormDataSteps {
	etor_id: number;
	etor_ordem: number;
	etapa_nome_id: string;
	etor_tempo: string;
	etor_insumos: string[];
	etor_observacoes: string;
	etor_unidade: string;
};

// ------ FormsDataDelete ------

export interface DeleteBatch {
	lote_id: number;
	lote_codigo: string;
	dproduto: string;
	reason: string;
}

export interface DeleteSteps {
	etor_id: number,
	dstep: string,
	reason: string,
}
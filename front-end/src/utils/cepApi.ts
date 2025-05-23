import { Dispatch, SetStateAction } from "react";
import { PlaceData2 } from "./types";

type CepResponse = {
	erro?: boolean;
	logradouro: string;
	localidade: string;
	uf: string;
};

export async function cepApi(
	cep: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setFormData: React.Dispatch<React.SetStateAction<any>>,
	setOpenModal: (open: boolean) => void,
	setMessage: (msg: string) => void,
	setSuccessMsg: (sucessMsg: boolean) => void,
	setCities: Dispatch<SetStateAction<PlaceData2[] | undefined>>
) {
	const cepLimpo = cep.replace(/\D/g, "");

	if (cepLimpo.length !== 8) {
		return;
	}

	setSuccessMsg(false);

	try {
		const cep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
		const cities = await fetch(
			`https://servicodados.ibge.gov.br/api/v1/localidades/municipios`
		);

		const cepData: CepResponse = await cep.json();
		const citiesData = await cities.json();

		if (cepData.erro) {
			setOpenModal(true);
			setMessage("CEP não encontrado!");
			return cepData.erro;
		}

		if (!citiesData) {
			setOpenModal(true);
			setMessage("Cidades não foram encontradas!");
			return;
		}

		setCities(citiesData);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setFormData((prevData: any) => ({
			...prevData,
			endereco: cepData.logradouro,
			estado: cepData.uf,
			cidade: cepData.localidade,
		}));

		return cepData;
	} catch (error) {
		console.error("Erro ao buscar o CEP:", error);
		alert("Erro ao buscar o CEP. Tente novamente.");
	}
}

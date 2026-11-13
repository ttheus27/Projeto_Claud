import { validarEFormatarOrcamento } from "../../../domain/orcamento.js";
export const makeCreateOrcamento = ({ repository }) => data => repository.criar(validarEFormatarOrcamento(data));

import { UsuarioEntity } from "./UsuarioEntity";

export interface VerificacaoUsuarioEntity {
    id: number;
    codigoVerificacao: number;
    utilizado: boolean;
    usuario: UsuarioEntity;
    codigoVerificacaoDigitadoUsuario: number;
}
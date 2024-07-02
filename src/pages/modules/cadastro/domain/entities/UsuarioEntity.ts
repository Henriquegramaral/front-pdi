export interface UsuarioEntity{
    id: number;
    email: string;
    senha: string;
    nome: string;
    verificado: boolean;
    confirmeSenha: string;
}
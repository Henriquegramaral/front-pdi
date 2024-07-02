import { UsuarioEntity } from "@/pages/modules/cadastro/domain/entities/UsuarioEntity";
import { PassoPdiEntity } from "./PassoPdiEntity";

export interface CabecalhoPdiEntity{
    id: number;
    area: string;
    titulo: string;
    dataCadastro: Date;
    usuario: UsuarioEntity;
    passos: PassoPdiEntity[]; 
}
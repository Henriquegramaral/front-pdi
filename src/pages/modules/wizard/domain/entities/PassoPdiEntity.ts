import { DicasPdiEntity } from "./DicasPdiEntity";
import { ItemPdiEntity } from "./ItemPdiEntity";
import { TipoPdiEntity } from "./TipoPdiEntity";

export interface PassoPdiEntity{
    id: number;
    tipo: TipoPdiEntity;
    itens: ItemPdiEntity[]; 
    dicas: DicasPdiEntity[];
}
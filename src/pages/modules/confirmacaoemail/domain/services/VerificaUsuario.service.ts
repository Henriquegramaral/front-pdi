import { VerificacaoUsuarioEntity } from "@/pages/modules/cadastro/domain/entities/VerificacaoUsuarioEntity";
import axios, { AxiosError } from "axios";

export default class VerificaUsuarioService {
  private readonly axiosInstance = axios.create({
    baseURL: 'http://localhost:4200/pdi/api/'
  });

  constructor() {
    this.axiosInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.log(error);
        if (error.response) {
          return Promise.resolve(error.response);
        }
        return Promise.reject(error);
      }
    );
  }    

  async execute(usuario: VerificacaoUsuarioEntity): Promise<any> {
      return await this.axiosInstance.post('autentica/verifica', usuario);
  }
}
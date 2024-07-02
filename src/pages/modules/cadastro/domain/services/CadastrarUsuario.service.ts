import axios, { AxiosError } from "axios";
import { UsuarioEntity } from "../entities/UsuarioEntity";

export default class CadastrarUsuarioService {
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

  async execute(usuario: UsuarioEntity): Promise<any> {
      return await this.axiosInstance.post('usuario', usuario);
  }
}
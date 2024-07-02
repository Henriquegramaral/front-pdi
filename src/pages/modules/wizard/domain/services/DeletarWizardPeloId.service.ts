import axios, { AxiosError } from "axios";

export default class DeletarWizardPeloIdService {
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

  async execute(id: number): Promise<any> {
      return await this.axiosInstance.delete('wizard/' + id);
  }
}
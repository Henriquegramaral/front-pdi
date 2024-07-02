import axios, { AxiosError } from "axios";
import { CabecalhoPdiEntity } from "../entities/CabecalhoPdiEntity";

export default class SalvaWizardService {
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

  async execute(pdi: CabecalhoPdiEntity): Promise<any> {
      return await this.axiosInstance.post('wizard/save', pdi);
  }
}
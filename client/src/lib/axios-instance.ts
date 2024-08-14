import axios, { AxiosError, AxiosResponse } from "axios";
import { ErrorResponse } from "../types/error-response";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
});

export const setupAxiosInterceptors = (
  showToast: (
    title: string,
    description: string,
    isDestructive: boolean
  ) => void
) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      showToast("Request Error", error.message, true);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ErrorResponse>) => {
      if (error.response) {
        const errorMessage =
          error.response.data?.message || error.response.statusText;

        showToast("Request Error", errorMessage, true);
      } else if (error.request) {
        showToast("Network Error", "Please try again later", true);
      } else {
        showToast("Request Error", error.message, true);
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;

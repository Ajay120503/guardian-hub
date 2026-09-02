import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api" });
api.interceptors.request.use(config => { const token = localStorage.getItem("guardian_token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use(r => r, error => { if (error.response?.status === 401) { localStorage.removeItem("guardian_token"); localStorage.removeItem("guardian_user"); if (!location.pathname.startsWith("/login")) location.assign("/login"); } return Promise.reject(error); });
export const messageOf = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message ?? error.message : "Something went wrong";

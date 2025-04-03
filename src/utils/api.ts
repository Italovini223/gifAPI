import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.backblazeb2.com/b2api/v2"
})
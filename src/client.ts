import axios, { AxiosInstance } from "axios";
import config from "./config.js";

let client: AxiosInstance | null = null;

const initalizeClient = (): void => {
  const internalClient = axios.create({
    baseURL: config.store,
    timeout: 10_000,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "multipart/form-data",
      Host: config.store.replace("https://", ""),
      Origin: config.store,
      Referer: `${config.store}/merchant/theme-editor`,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0",
    },
    withCredentials: true,
  });

  internalClient.interceptors.response.use(function (response) {
    const responseUrl = response.request._header.split("\n")[0].split("?")[0];

    if (responseUrl.includes("/shopify/login")) {
      throw "Invalid Credentials, please log into recharge.";
    }

    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  client = internalClient;
}

export { initalizeClient, client };

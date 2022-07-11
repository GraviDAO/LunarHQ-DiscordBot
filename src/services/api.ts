import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { lunarHQ_url, API_SECRET } from "../../config.json";
import jwt from "jsonwebtoken";
import {
  apiRuleData,
  GetRulesResponse,
  nftRuleData,
  stakedNftRuleData,
  tokenRuleData,
} from "../shared/apiTypes";

interface apiParams {
  baseUrl?: string;
  token?: string;
}

class API {
  private apiBaseUrl: string = lunarHQ_url;
  private apiToken: string = API_SECRET;

  constructor(params?: apiParams) {
    this.apiBaseUrl = params?.baseUrl ?? this.apiBaseUrl;
    this.apiToken = params?.token ?? this.apiToken;
  }

  private sign(guildId: string, accessTypes: string[]) {
    return jwt.sign(
      { discordServerId: guildId, accessTypes: accessTypes },
      this.apiToken,
      { expiresIn: "15m" }
    );
  }

  async deleteRule(guildId: string, ruleId: string): Promise<AxiosResponse> {
    return (
      await this.delete(
        `deleteRule/${ruleId}`,
        this.config(this.sign(guildId, ["deleteRule"]), {
          discordServerId: guildId,
        })
      )
    ).data;
  }

  async getNftRules(guildId: string): Promise<GetRulesResponse> {
    return (
      await this.get(
        "getRules",
        this.config(this.sign(guildId, ["getRules"]), {
          discordServerId: guildId,
        })
      )
    ).data.message;
  }

  async addNftRule(data: nftRuleData): Promise<AxiosResponse> {
    return (
      await this.post(
        "addNftRule",
        this.config(this.sign(data.discordServerId, ["addNftRule"])),
        data
      )
    ).data;
  }

  async addStakedNftRule(data: stakedNftRuleData): Promise<AxiosResponse> {
    return (
      await this.post(
        "addStakedNftRule",
        this.config(this.sign(data.discordServerId, ["addStakedNftRule"])),
        data
      )
    ).data;
  }

  async addTokenRule(data: tokenRuleData): Promise<AxiosResponse> {
    return (
      await this.post(
        "addTokenRule",
        this.config(this.sign(data.discordServerId, ["addTokenRule"])),
        data
      )
    ).data;
  }

  async addApiRule(data: apiRuleData): Promise<AxiosResponse> {
    return (
      await this.post(
        "addApiRule",
        this.config(this.sign(data.discordServerId, ["addApiRule"])),
        data
      )
    ).data;
  }

  private config(token: string, params?: any): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
    };
  }

  private get(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.apiBaseUrl + url, config)
        .then((response) => {
          if (response.status === 200) {
            resolve(response);
          } else {
            reject(response);
          }
          3;
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private post(
    url: string,
    config: AxiosRequestConfig,
    data: any
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios
        .post(this.apiBaseUrl + url, data, config)
        .then((response) => {
          if (response.status === 200) {
            resolve(response);
          } else {
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private delete(
    url: string,
    config: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios
        .delete(this.apiBaseUrl + url, config)
        .then((response) => {
          if (response.status === 200) {
            resolve(response);
          } else {
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export const api = new API();

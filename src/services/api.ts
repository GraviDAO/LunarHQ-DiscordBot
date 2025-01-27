import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import jwt from "jsonwebtoken";
import { API_SECRET, lunarHQ_url } from "../../config.json";
import {
  AbstractCollection,
  apiRuleData,
  complexRuleData,
  CreateProposal,
  CreateProposalAddMsgId,
  DefinedAbstractCollection,
  GetProposalResultsResponse,
  GetProposalsResponse,
  GetRulesResponse,
  GetUsersWalletsResponse,
  IndexedCollection,
  nftRuleData,
  Proposal,
  stakedNftRuleData,
  tokenRuleData,
} from "../shared/apiTypes";

interface apiParams {
  baseUrl?: string;
  token?: string;
}

const SUB = "discordBot";

class API {
  private apiBaseUrl: string = lunarHQ_url;
  private apiToken: string = API_SECRET;

  constructor(params?: apiParams) {
    this.apiBaseUrl = params?.baseUrl ?? this.apiBaseUrl;
    this.apiToken = params?.token ?? this.apiToken;
  }

  async getAllAbstractCollections(): Promise<AbstractCollection[]> {
    return (
      await this.get(
        "abstractCollection/all",
        this.config(this.sign(undefined, ["getAbstractCollections"]))
      )
    ).data;
  }

  async getDefinedAbstractCollections(): Promise<DefinedAbstractCollection[]> {
    return (
      await this.get(
        "abstractCollection/all/defined",
        this.config(this.sign(undefined, ["getAbstractCollections"]))
      )
    ).data;
  }

  async getIndexedCollections(): Promise<IndexedCollection[]> {
    return (
      await this.get(
        "indexedCollections",
        this.config(this.sign(undefined, ["getIndexedCollections"]))
      )
    ).data;
  }

  async getRules(guildId: string): Promise<GetRulesResponse> {
    return (
      await this.get(
        "getRules",
        this.config(this.sign(guildId, ["getRules"]), {
          discordServerId: guildId,
        })
      )
    ).data.message;
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

  async addNftRule(data: nftRuleData): Promise<number> {
    return (
      await this.post(
        "addNftRule",
        this.config(this.sign(data.discordServerId, ["addNftRule"])),
        data
      )
    ).data.ruleId;
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

  async addComplexRule(data: complexRuleData): Promise<AxiosResponse> {
    return (
      await this.post(
        "addComplexRule",
        this.config(this.sign(data.discordServerId, ["addComplexRule"])),
        data
      )
    ).data;
  }

  async createProposal(data: CreateProposal): Promise<Proposal> {
    return (
      await this.post(
        "createProposal",
        this.config(this.sign(data.discordServerId, ["createProposal"])),
        data
      )
    ).data.message;
  }

  async createProposalAddMsgId(
    discordServerId: string,
    data: CreateProposalAddMsgId
  ): Promise<Proposal> {
    return (
      await this.post(
        "createProposal",
        this.config(this.sign(discordServerId, ["createProposal"])),
        data
      )
    ).data.message;
  }

  async deleteProposal(
    guildId: string,
    proposalId: string
  ): Promise<AxiosResponse> {
    return (
      await this.delete(
        `deleteProposal/${proposalId}`,
        this.config(this.sign(guildId, ["deleteProposal"]), {
          discordServerId: guildId,
        })
      )
    ).data;
  }

  async getProposals(guildId: string): Promise<GetProposalsResponse> {
    return (
      await this.get(
        "getProposals",
        this.config(this.sign(guildId, ["getProposals"]), {
          discordServerId: guildId,
        })
      )
    ).data.message;
  }

  async openProposal(
    guildId: string,
    proposalId: string
  ): Promise<AxiosResponse> {
    return (
      await this.put(
        `openProposal/${proposalId}`,
        this.config(this.sign(guildId, ["openProposal"])),
        {
          discordServerId: guildId,
          proposalId: proposalId,
        }
      )
    ).data;
  }

  async closeProposal(
    guildId: string,
    proposalId: string
  ): Promise<GetProposalsResponse> {
    return (
      await this.put(
        `closeProposal/${proposalId}`,
        this.config(this.sign(guildId, ["closeProposal"])),
        {
          discordServerId: guildId,
          proposalId: proposalId,
        }
      )
    ).data.message;
  }

  async getProposalResults(
    guildId: string,
    proposalId: string,
    messageId: string
  ): Promise<GetProposalResultsResponse> {
    return (
      await this.get(
        `getProposalResults/${proposalId}`,
        this.config(this.sign(guildId, ["getProposalResults"]), {
          discordServerId: guildId,
          discordMessageId: messageId,
        })
      )
    ).data.message;
  }

  async castVote(
    guildId: string,
    vote: string,
    userId: string,
    messageId: string
  ) {
    return (
      await this.post(
        "castVote",
        this.config(this.sign(guildId, ["castVote"])),
        {
          discordUserId: userId,
          discordMessageId: messageId,
          vote: vote,
        }
      )
    ).data;
  }

  async resetVote(guildId: string, userId: string, messageId: string) {
    return (
      await this.put(
        "resetVote",
        this.config(this.sign(guildId, ["resetVote"]), {
          discordUserId: userId,
          discordMessageId: messageId,
          discordServerId: guildId,
        }),
        {}
      )
    ).data;
  }

  async getUsersWallets(userId: string): Promise<GetUsersWalletsResponse> {
    return (
      await this.get(
        "getUsersWallets",
        this.config(this.sign(undefined, ["getUsersWallets"]), {
          discordUserId: userId,
        })
      )
    ).data.message;
  }

  async unlinkWallet(userId: string, address: string, blockchainName: string) {
    return (
      await this.put(
        "unlinkWallet",
        this.config(this.sign(undefined, ["unlinkWallet"]), {
          discordUserId: userId,
          address: address,
          blockchainName: blockchainName,
        }),
        {}
      )
    ).data;
  }

  private sign(guildId: string | undefined, accessTypes: string[]) {
    return jwt.sign(
      { discordServerId: guildId, accessTypes: accessTypes, sub: SUB },
      this.apiToken,
      { expiresIn: "15m" }
    );
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

  private put(
    url: string,
    config: AxiosRequestConfig,
    data: any
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios
        .put(this.apiBaseUrl + url, data, config)
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

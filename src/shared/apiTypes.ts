export type ServerRule = {
    id: number,
    discordServerId: string,
    quantity: number,
    discordRole: string,
    apiUrl: string,
    createdAt: string,
    updatedAt: string,
    nftCollection: NftCollection,
  };

export type NftCollection = {
  id: number,
  name: string,
  description: string,
  symbol: string,
  address: string,
  numTokens: number,
  createdAt: string,
  updatedAt: string,
}

export interface GenericRule {
  id: string,
  blockchainName: string,
  address: string,
  quantity: number | null,
  role: string,
  tokenIds: string[] | null,
  apiUrl: string,
  createdAt: Date,
}

export interface GetRulesResponse {
  rules: GenericRule[],
}
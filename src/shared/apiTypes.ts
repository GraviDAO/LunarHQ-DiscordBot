export type ServerRule = {
  id: number;
  discordServerId: string;
  quantity: number;
  discordRole: string;
  apiUrl: string;
  createdAt: string;
  updatedAt: string;
  nftCollection: NftCollection;
};

export type NftCollection = {
  id: number;
  name: string;
  description: string;
  symbol: string;
  address: string;
  numTokens: number;
  createdAt: string;
  updatedAt: string;
};

export interface GenericRule {
  id: string;
  blockchainName: string;
  address: string;
  quantity: number | null;
  quantityOperatorName: string;
  role: string;
  tokenIds: string[] | null;
  apiUrl: string;
  complexExpression: string | null;
  createdAt: Date;
}

export interface GetRulesResponse {
  rules: GenericRule[];
}

export interface nftRuleData {
  nftAddress: string;
  tokenIds: string[];
  quantity: number;
  quantityOperatorName: string;
  role: string;
  discordServerId: string;
  blockchainName: string;
  discordChannelId: string;
  discordMessageId: string;
}

export interface stakedNftRuleData {
  nftAddress: string;
  stakedNftAddress: string;
  tokenIds: string[];
  quantity: number;
  quantityOperatorName: string;
  role: string;
  discordServerId: string;
  blockchainName: string;
}

export interface tokenRuleData {
  tokenAddress: string;
  quantity: number;
  quantityOperatorName: string;
  role: string;
  discordServerId: string;
  discordChannelId: string;
  blockchainName: string;
}

export interface apiRuleData {
  apiUrl: string;
  role: string;
  discordServerId: string;
  blockchainName: string;
}

export interface complexRuleData {
  description?: string;
  complexExpression: string;
  role: string;
  discordServerId: string;
  discordChannelId?: string;
}

export interface CreateProposal {
  title: string;
  description: string;
  address: string;
  votingSystem: string;
  creatorDiscordId: string;
  quorum: string;
  discordServerId: string;
  blockchainName: string;
  discordMessageId?: string;
  discordChannelId: string;
  numberPerVote: number;
  startDate: Date;
  endDate: Date;
  ruleIds: string[];
}

export interface CreateProposalAddMsgId {
  proposalId: number;
  discordMessageId: string;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  address: string;
  votingSystem: string;
  creatorDiscordId: string;
  quorum: string;
  startDate: Date;
  endDate: Date;
  discordMessageId: string;
  discordChannelId: string;
  discordServerId: string;
  blockchainName: string;
  status: string;
}

export interface GetProposalsResponse {
  proposals: Proposal[];
}

export interface ProposalChoice {
  choice: string;
  votes: number;
}

export interface GetProposalResultsResponse {
  proposal: Proposal;
  choices: ProposalChoice[];
}

export enum ProposalStatus {
  Pending = "Pending",
  Active = "Active",
  Closed = "Closed",
}

export interface AccountWallet {
  id: number;
  address: string;
  blockchainName: string;
}

export interface GetUsersWalletsResponse {
  accountWallets: AccountWallet[];
}

export interface PollResults {
  yes: number;
  no: number;
  abstain: number;
  total: number;
}

export interface Poll {
  title: string;
  description: string;
  uuid: string;
  creator: string;
  active: boolean;
  quorum: number;
  endsAt: number;
  votes: {
    yes: string[];
    no: string[];
    abstain: string[];
  };
  results?: PollResults | null;
  contractAddress: string;
  messageId?: string;
  channelId?: string;
}

export interface IndexedCollection {
  name: string;
  address: string;
  symbol: string;
  blockchain: Blockchain;
}

export interface Blockchain {
  name: string;
  chainId: string;
}

export interface AbstractCollection {
  chainName: string;
  chainId: string;
  collections: FullAbstractCollection[];
}

export interface FullAbstractCollection {
  name: string;
  symbol: string;
  address: string;
  supply: number;
  homeCollection: boolean;
  admin: string;
  creator: string;
  minter: string;
  codeId: number;
}

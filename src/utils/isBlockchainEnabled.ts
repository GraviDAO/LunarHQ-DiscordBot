import chains from "../../blockchains.json";

export const isBlockchainEnabled = (
  blockchain: string,
  support?: "nftRule" | "tokenRule"
) => {
  const chain = Object.entries(chains).find(
    ([_, value]) => value.name === blockchain
  )?.[1];
  if (!chain || !chain.enabled) return false;
  if (!support) return true;
  return chain.support[support];
};

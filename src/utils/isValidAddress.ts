 const isValidTerraAddress = (address: string) => {
  return /(terra(valoper)?1([a-z0-9]{38}|[a-z0-9]{58}))/g.test(address);
};

 const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidStargazeAddress = (address: string) => {
  return /^stars[a-z0-9]{59}$/.test(address);
};

const isValidArchwayAddress = (address: string) => {
  return /(archway(valoper)?1([a-z0-9]{38}))/g.test(address);
};

export const isValidAddress = (address: string, blockchainName: string) => {
  if(blockchainName === "Terra" || blockchainName === "Terra Classic")
  {
    return isValidTerraAddress(address);
  }
  if(blockchainName === "polygon-mainnet")
  {
    return isValidEthereumAddress(address);
  }
  if(blockchainName === "Stargaze")
  {
    return isValidStargazeAddress(address);
  }
  if(blockchainName === "Archway")
  {
    return isValidArchwayAddress(address);
  }

}
//archway10425flc7vh9pvzjcjkhs938j74llgv40fyscus
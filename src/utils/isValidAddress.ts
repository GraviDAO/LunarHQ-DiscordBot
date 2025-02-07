const isValidTerraAddress = (address: string) => {
  return /(terra(valoper)?1([a-z0-9]{38}|[a-z0-9]{58}))/g.test(address);
};

const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidStargazeAddress = (address: string) => {
  return /^stars1[a-z0-9]{58}$/.test(address);
};

const isValidArchwayAddress = (address: string) => {
  return /(archway(valoper)?1([a-z0-9]{38}))/g.test(address);
};

const isValidJunoAddress = (address: string) => {
  return /(juno(valoper)?1([a-z0-9]{58}))/g.test(address);
};

const isValidOsmosisAddress = (address: string) => {
  return /(osmo1([a-z0-9]{58}))/g.test(address);
};

const isValidNeutronAddress = (address: string) => {
  return /(neutron1([a-z0-9]{58}))/g.test(address);
};

const isValidInjectiveAddress = (address: string) => {
  return /^inj1[a-z0-9]{38}$/.test(address);
};

const isValidMigalooAddress = (address: string) => {
  return /^migaloo1[a-z0-9]{58}$/.test(address);
};

const isValidCosmosAddress = (address: string) => {
  return /(cosmos1([a-z0-9]{38}))/g.test(address);
};

export const isValidAddress = (address: string, blockchainName: string) => {
  switch (blockchainName) {
    case "Terra":
    case "Terra Classic":
      return isValidTerraAddress(address);
    case "polygon-mainnet":
      return isValidEthereumAddress(address);
    case "Stargaze":
      return isValidStargazeAddress(address);
    case "Archway":
      return isValidArchwayAddress(address);
    case "Juno":
      return isValidJunoAddress(address);
    case "Osmosis":
      return isValidOsmosisAddress(address);
    case "Neutron":
      return isValidNeutronAddress(address);
    case "Injective":
      return isValidInjectiveAddress(address);
    case "Migaloo":
      return isValidMigalooAddress(address);
    case "Cosmos":
      return isValidCosmosAddress(address);
    default:
      return false;
  }
};
//archway10425flc7vh9pvzjcjkhs938j74llgv40fyscus

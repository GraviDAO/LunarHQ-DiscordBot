export const isValidTerraAddress = (address: string) => {
  return /(terra1[a-z0-9]{38})/g.test(address);
};

export const isValidTerraAddress = (address: string) => {
  return /(terra(valoper)?1([a-z0-9]{38}|[a-z0-9]{58}))/g.test(address);
};

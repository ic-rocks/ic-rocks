export const getSubnetType = (type: string) => {
  switch (type) {
    case "UNSPECIFIED":
      return "Unspecified";
    case "SUBNET_TYPE_APPLICATION":
      return "Application";
    case "SUBNET_TYPE_SYSTEM":
      return "System";
    case "SUBNET_TYPE_PREMIUM_APPLICATION":
      return "Premium Application";
    case "SUBNET_TYPE_VERIFIED_APPLICATION":
      return "Verified Application";
    default:
      return type;
  }
};

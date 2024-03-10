import { createConfig, http } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";

const config = createConfig({
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_INFURA_KEY),
    [localhost.id]: http(),
  },
});
 

export default config;

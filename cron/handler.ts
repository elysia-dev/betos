import axios from "axios";

export const run = async (event) => {
  const res = await axios.post(
    "https://betos.vercel.app/api/handler",
    {
      betosAddress: process.env.BETOS_ADDRESS,
      network: process.env.NETWORK,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APTOS_KEY}`,
      },
    }
  );

  return {
    statusCode: 200,
  };
};

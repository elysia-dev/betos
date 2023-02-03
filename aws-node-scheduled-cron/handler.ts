import axios from "axios";

export const run = async (event) => {
  const res = await axios.post(
    "https://betos.vercel.app/api/handler",
    {
      action: "execute",
      betosAddress: process.env.BETOS_ADDRESS,
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

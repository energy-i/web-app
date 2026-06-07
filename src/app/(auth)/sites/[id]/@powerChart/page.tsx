import prisma from "@/lib/prisma";
import { getSiteData } from "@/lib/solaredge";

const PowerChart = async ({ id }: { id: string }) => {
  const site = await prisma.site.findFirst({
    where: {
      id,
    },
  });

  if (!site || site.commsVendor !== "SOLAREDGE" || !site.commsId) {
    return <div>Site not found</div>;
  }

  const { powerData } = await getSiteData({ siteId: site.commsId });

  return <pre>{JSON.stringify(powerData, null, 2)}</pre>;
};

export default PowerChart;

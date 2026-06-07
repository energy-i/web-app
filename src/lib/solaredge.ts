export async function getSiteData({ siteId }: { siteId: string }): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  powerData: any;
}> {
  const response = await fetch(
    `https://monitoringapi.solaredge.com/sites/${siteId}/overview?api_key=${process.env.SOLAREDGE_API_KEY}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch site data");
  }

  const data = await response.json();
  return {
    powerData: data,
  };
}

import Link from "next/link";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Site } from "@/lib/types";

const SitesTable = ({ sites }: { sites: Site[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Energy Usage (kWh)</TableHead>
          <TableHead>Revenue ($)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => (
          <TableRow key={site.id}>
            <TableHead>
              <Link href={`/sites/${site.id}`}>{site.name}</Link>
            </TableHead>
            <TableHead>{site.city}</TableHead>
            <TableHead>1,000</TableHead>
            <TableHead>500.00</TableHead>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SitesTable;

import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
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
            <TableCell>
              <Link href={`/sites/${site.id}`}>{site.name}</Link>
            </TableCell>
            <TableCell>{site.city}</TableCell>
            <TableCell>1,000</TableCell>
            <TableCell>500.00</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SitesTable;

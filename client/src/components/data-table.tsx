/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableColumn {
  label: string;
  render: (item: any) => JSX.Element | string;
}

interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: (item: any) => JSX.Element;
  emptyMessage?: string;
}

const DataTable = ({
  data,
  columns,
  actions,
  emptyMessage = "No data found.",
}: DataTableProps) => {
  if (!data || data.length === 0) {
    return <p className="mx-auto">{emptyMessage}</p>;
  }

  return (
    <Table className="border border-gray-300">
      <TableHeader>
        <TableRow className="bg-gray-100">
          {columns.map((column) => (
            <TableHead
              className="py-2 px-4 border border-gray-300"
              key={column.label}
            >
              {column.label}
            </TableHead>
          ))}
          {actions && (
            <TableHead className="py-2 px-4 border border-gray-300">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={item._id} className="even:bg-gray-50 odd:bg-white">
            {columns.map((column, index) => (
              <TableCell
                className="py-2 px-4 border border-gray-300"
                key={index}
              >
                {column.render(item)}
              </TableCell>
            ))}
            {actions && (
              <TableCell className="py-2 px-4 border border-gray-300">
                {actions(item)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;

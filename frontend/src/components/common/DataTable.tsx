import React from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
}

export default function DataTable<T>({ data, columns }: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-3">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.map((item, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4">{col.accessor(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

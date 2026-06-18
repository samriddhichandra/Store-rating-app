/**
 * Generic table with clickable column headers for ascending/descending sort.
 * `columns`: [{ key, label, sortable=true, render?: (row) => node }]
 */
export default function SortableTable({ columns, data, sortBy, order, onSort, emptyText = 'No records found.' }) {
  const handleSort = (col) => {
    if (col.sortable === false) return;
    if (sortBy === col.key) {
      onSort(col.key, order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(col.key, 'ASC');
    }
  };

  return (
    <div className="card overflow-x-auto animate-scale-in">
      <table className="w-full text-sm text-slate-200">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`text-left px-4 py-3 font-display font-semibold text-slate-300 whitespace-nowrap transition-all duration-200 ${
                  col.sortable === false ? '' : 'cursor-pointer select-none hover:text-primary-light hover:bg-white/[0.03]'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortBy === col.key && (
                    <span className="text-accent animate-fade-in">{order === 'ASC' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i}
                  className="border-b border-white/10 last:border-0 hover:bg-white/[0.04] transition-all duration-150"
                  style={{ animationDelay: `${i * 0.03}s` }}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import React from "react";

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
            <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: '24px' }}></div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={`th-${i}`} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div className="skeleton skeleton-text" style={{ width: '60%', margin: 0, height: '12px' }}></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={`tr-${rowIndex}`}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={`td-${rowIndex}-${colIndex}`} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="skeleton skeleton-text" style={{ width: colIndex === 0 ? '80%' : '50%', margin: 0 }}></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;

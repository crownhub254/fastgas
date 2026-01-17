'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({
    columns,
    data,
    itemsPerPage = 5,
    emptyMessage = "No data found",
    EmptyIcon
}) {
    const [currentPage, setCurrentPage] = useState(1)

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = data.slice(startIndex, endIndex)

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
            }
        }

        return pages
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={column.className || ''}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={column.cellClassName || ''}
                                        >
                                            {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-12">
                                    {EmptyIcon && (
                                        <div className="flex flex-col items-center">
                                            <EmptyIcon className="w-16 h-16 mb-4 opacity-30" />
                                            <p className="text-base-content/70">{emptyMessage}</p>
                                        </div>
                                    )}
                                    {!EmptyIcon && <p className="text-base-content/70">{emptyMessage}</p>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-base-300">
                    {/* Info */}
                    <div className="text-sm text-base-content/70">
                        Showing <span className="font-semibold text-base-content">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold text-base-content">{Math.min(endIndex, data.length)}</span> of{' '}
                        <span className="font-semibold text-base-content">{data.length}</span> entries
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn btn-sm btn-ghost"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' && goToPage(page)}
                                    disabled={page === '...'}
                                    className={`btn btn-sm ${page === currentPage
                                            ? 'btn-primary'
                                            : page === '...'
                                                ? 'btn-ghost cursor-default'
                                                : 'btn-ghost'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn btn-sm btn-ghost"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

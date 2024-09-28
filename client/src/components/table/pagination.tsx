import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    const halfPageNumbers = Math.floor(maxPageNumbersToShow / 2);

    let startPage = Math.max(1, currentPage - halfPageNumbers);
    let endPage = Math.min(totalPages, currentPage + halfPageNumbers);

    if (startPage === 1) {
      endPage = Math.min(maxPageNumbersToShow, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPageNumbersToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return (
      <div className="flex space-x-2">
        {pageNumbers.map((number, index) => (
          <Button
            key={index}
            variant={number === currentPage ? "default" : "outline"}
            onClick={() => {
              if (typeof number === "number") {
                onPageChange(number);
              }
            }}
            disabled={typeof number === "string"}
          >
            {number}
          </Button>
        ))}
      </div>
    );
  };

  return <div>{renderPagination()}</div>;
};

export default Pagination;

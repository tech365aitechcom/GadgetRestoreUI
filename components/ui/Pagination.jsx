'use client'

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

const Pagination = ({ className = '', ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={`mx-auto flex w-full justify-center ${className}`}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <ul
    ref={ref}
    className={`flex flex-row items-center gap-1.5 list-none m-0 p-0 ${className}`}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className = '', ...props }, ref) => (
  <li ref={ref} className={`${className}`} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
  className = '',
  isActive,
  disabled,
  children,
  ...props
}) => (
  <button
    aria-current={isActive ? "page" : undefined}
    disabled={disabled}
    className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
      isActive
        ? 'bg-[var(--theme-text-primary)] text-[var(--theme-bg)] cursor-default'
        : 'border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface)] disabled:opacity-40 disabled:cursor-not-allowed'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className = '',
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to previous page"
    disabled={disabled}
    className={`px-3 w-auto gap-1 ${className}`}
    {...props}
  >
    <ChevronLeft size={16} />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className = '',
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to next page"
    disabled={disabled}
    className={`px-3 w-auto gap-1 ${className}`}
    {...props}
  >
    <span>Next</span>
    <ChevronRight size={16} />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className = '',
  ...props
}) => (
  <span
    aria-hidden
    className={`flex h-9 w-9 items-center justify-center text-[var(--theme-text-tertiary)] ${className}`}
    {...props}
  >
    <MoreHorizontal size={16} />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

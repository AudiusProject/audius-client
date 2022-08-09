import { useCallback, useEffect, useMemo } from 'react'

import cn from 'classnames'
import {
  useTable,
  useSortBy,
  useResizeColumns,
  useFlexLayout
} from 'react-table'
import { AutoSizer, List } from 'react-virtualized'

import { ReactComponent as IconCaretDown } from 'assets/img/iconCaretDownLine.svg'
import { ReactComponent as IconCaretUp } from 'assets/img/iconCaretUpLine.svg'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './TestTable.module.css'

type TestTableProps = {
  columns: any[]
  data: any[]
  loading?: boolean
  animateTransitions?: boolean
  activeIndex: number
  wrapperClassName?: string
  tableClassName?: string
  getRowClassName?: (rowIndex: number) => string
  defaultSorter?: (a: any, b: any) => number
  onClickRow?: (rowInfo: any, index: number) => void
  onSort?: (sortProps: {
    column: { sorter: (a: any, b: any) => number }
    order: string
  }) => void
  onReorder?: () => void
  isPaginated?: boolean
  isReorderable?: boolean
  isVirtualized?: boolean
  maxRowNum?: number
}

/* TODO:
  - Add drag and drop
  - Figure out how we should handle the small screen issue
    - Should we add horizontal scrolling with another wrapper or should we reduce the number of columns
  - There is an issue where the columns will overflow to the right of the table if the user makes all of the columns the max width
    - Need to find a way to prevent the columns from taking up more that the tables max width
*/

export const TestTable = ({
  columns,
  data,
  loading = false,
  animateTransitions = true,
  activeIndex,
  wrapperClassName,
  tableClassName,
  getRowClassName,
  defaultSorter,
  onClickRow,
  onSort,
  onReorder,
  isPaginated = false,
  isReorderable = false,
  isVirtualized = false,
  maxRowNum = 20
}: TestTableProps) => {
  const defaultColumn = useMemo(
    () => ({
      sortable: true,
      // Default resizing column props
      minWidth: 64,
      width: 100,
      maxWidth: 200
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // hiddenColumns array is also available here
    state: { sortBy }
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetSortBy: false,
      autoResetExpanded: false,
      // autoResetPage: false,
      // autoResetExpanded: false,
      // autoResetGroupBy: false,
      // autoResetSelectedRows: false,
      // autoResetFilters: false,
      autoResetRowState: false,
      manualSortBy: true
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout
  )

  // NOTE: react-table allows for multple sorters, but we are only checking the first here
  // - This can be updated if we need multiple sorters in the future
  const handleSortChange = useCallback(() => {
    let sorter = null
    let order = 'ascend'

    if (sortBy.length === 0) {
      // Use defaultSorter if sortBy array is empty
      sorter = defaultSorter
    } else {
      // Use the sorter from the column
      const sortColumn = columns.find((c) => c.id === sortBy[0].id)
      sorter = sortColumn?.sorter
      order = sortBy[0]?.desc ? 'descend' : 'ascend'
    }

    if (sorter) {
      onSort?.({ column: { sorter }, order })
    }
  }, [columns, defaultSorter, onSort, sortBy])

  useEffect(handleSortChange, [handleSortChange, sortBy])

  const renderHeader = useCallback(() => {
    return headerGroups.map((headerGroup) => (
      <tr
        className={styles.tableHeadRow}
        {...headerGroup.getHeaderGroupProps()}
        key={headerGroup.id}
      >
        {headerGroup.headers.map((column) => (
          <th
            className={cn(styles.tableHeader, {
              [styles.titleHeader]: Boolean(column.accessor),
              [styles.leftAlign]: column.align === 'left',
              [styles.rightAlign]: column.align === 'right'
            })}
            {...column.getHeaderProps()}
            key={column.id}
          >
            {/* Sorting Container */}
            <div {...column.getSortByToggleProps()}>
              <div className={styles.textCell}>{column.render('Header')}</div>
              {column.sortable !== false ? (
                <div className={styles.sortCaretContainer}>
                  {!column.isSorted || !column.isSortedDesc ? (
                    <IconCaretUp className={styles.sortCaret} />
                  ) : null}
                  {!column.isSorted || column.isSortedDesc ? (
                    <IconCaretDown className={styles.sortCaret} />
                  ) : null}
                </div>
              ) : null}
            </div>
            {/* Resizing Container */}
            {!column.disableResizing && (
              <div
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                {...column.getResizerProps()}
                className={cn(styles.resizer, {
                  [styles.isResizing]: column.isResizing
                })}
              />
            )}
          </th>
        ))}
      </tr>
    ))
  }, [headerGroups])

  const renderRow = useCallback(
    ({ index, key, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <tr
          className={cn(styles.tableRow, getRowClassName?.(row.index), {
            [styles.active]: row.index === activeIndex
          })}
          {...row.getRowProps({ style })}
          key={key}
          onClick={() => onClickRow?.(row, row.index)}
        >
          {row.cells.map((cell) => {
            return (
              <td
                className={cn(styles.tableCell, {
                  [styles.leftAlign]: cell.column.align === 'left',
                  [styles.rightAlign]: cell.column.align === 'right'
                })}
                {...cell.getCellProps()}
                key={`${row.id}_${cell.getCellProps().key}`}
              >
                {cell.render('Cell')}
              </td>
            )
          })}
        </tr>
      )
    },
    [activeIndex, onClickRow, prepareRow, getRowClassName, rows]
  )

  const renderRows = useCallback(() => {
    return rows.map((row, i) => {
      prepareRow(row)
      return (
        <tr
          className={cn(styles.tableRow, getRowClassName?.(row.index), {
            [styles.active]: row.index === activeIndex
          })}
          {...row.getRowProps()}
          key={row.id}
          onClick={() => onClickRow?.(row, row.index)}
        >
          {row.cells.map((cell) => {
            return (
              <td
                className={cn(styles.tableCell, {
                  [styles.leftAlign]: cell.column.align === 'left',
                  [styles.rightAlign]: cell.column.align === 'right'
                })}
                {...cell.getCellProps()}
                key={`${row.id}_${cell.getCellProps().key}`}
              >
                {cell.render('Cell')}
              </td>
            )
          })}
        </tr>
      )
    })
  }, [activeIndex, onClickRow, prepareRow, getRowClassName, rows])

  const renderVistualizedRows = useCallback(() => {
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            height={Math.min(rows.length, maxRowNum + 0.5) * 44}
            width={width}
            // NOTE: Needed for the list to respond to column resizing, don't delete!
            onRowsRendered={() => {}}
            overscanRowsCount={2}
            rowCount={rows.length}
            rowHeight={44}
            rowRenderer={renderRow}
            // onScroll={() => {
            //   console.log('scroll')
            // }
          />
        )}
      </AutoSizer>
    )
  }, [maxRowNum, renderRow, rows.length])

  return (
    <div className={cn(styles.tableWrapper, wrapperClassName)}>
      <table
        className={cn(styles.table, tableClassName, {
          [styles.animatedTable]: animateTransitions
        })}
        {...getTableProps()}
      >
        <thead className={styles.tableHead}>{renderHeader()}</thead>
        {/* TODO: Need to confirm loading state with design */}
        {loading ? (
          <LoadingSpinner className={styles.loader} />
        ) : (
          <tbody
            className={styles.tableBody}
            style={{ maxHeight: (maxRowNum + 0.5) * 44 }}
            {...getTableBodyProps()}
          >
            {isVirtualized ? renderVistualizedRows() : renderRows()}
          </tbody>
        )}
      </table>
      {isPaginated ? <p>Render the pagination controls here</p> : null}
    </div>
  )
}

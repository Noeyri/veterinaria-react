import type { ReactNode } from 'react'

interface Props {
  title: string
  headers: string[]
  children: ReactNode
}

export default function DataTable({ title, headers, children }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body">
        <h2 className="h5 mb-0">{title}</h2>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

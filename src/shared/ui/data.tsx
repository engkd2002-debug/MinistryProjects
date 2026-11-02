import { type ReactNode, type CSSProperties } from 'react';
import { Columns3 } from 'lucide-react';
export interface TableColumn {
  key: string;
  label: ReactNode;
}
export function Table({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: TableColumn[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <div className="ui-table-scroll" tabIndex={0} role="region" aria-label={caption}>
      <table className="ui-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column, i) =>
                i === 0 ? (
                  <th key={column.key} scope="row">
                    {row[column.key]}
                  </th>
                ) : (
                  <td key={column.key}>{row[column.key]}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Metric({
  label,
  value,
  description,
}: {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="ui-metric">
      <span className="ui-metric__label">{label}</span>
      <strong>{value}</strong>
      {description && <span className="ui-metric__description">{description}</span>}
    </div>
  );
}
export function ChartFrame({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <figure className="ui-chart-frame">
      <figcaption>
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </figcaption>
      <div className="ui-chart-frame__content">{children}</div>
      {footer && <div className="ui-chart-frame__footer">{footer}</div>}
    </figure>
  );
}
export function Legend({ items }: { items: { label: ReactNode; color?: string }[] }) {
  return (
    <ul className="ui-legend">
      {items.map((item, index) => (
        <li key={index}>
          <span
            className="ui-legend__swatch"
            style={item.color ? ({ '--legend-color': item.color } as CSSProperties) : undefined}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
export function ComparisonIndicator({
  count,
  max = 8,
  label,
}: {
  count: number;
  max?: number;
  label: ReactNode;
}) {
  return (
    <div className="ui-comparison-indicator">
      <Columns3 size={17} aria-hidden="true" />
      <span>{label}</span>
      <strong>
        <bdi>
          {count} / {max}
        </bdi>
      </strong>
    </div>
  );
}

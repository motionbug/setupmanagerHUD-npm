export const tooltipStyles = {
  contentStyle: {
    backgroundColor: "var(--surface-overlay)",
    border: "1px solid var(--edge)",
    borderRadius: "12px",
    fontSize: "14px",
    padding: "12px 16px",
  },
  labelStyle: {
    color: "var(--ink)",
    fontWeight: 600,
    marginBottom: "4px",
  },
} as const;

export const CHART_COLORS = {
  success: "var(--jamf-green)",
  failure: "var(--jamf-red)",
} as const;

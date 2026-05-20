import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "./Filters";
import type { FilterState, StoredEvent } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  eventType: "all",
  macOSVersion: "",
  model: "",
  timeRange: "all",
  search: "",
};

const mockEvents: StoredEvent[] = [
  {
    eventId: "test-1",
    timestamp: Date.now(),
    payload: {
      event: "com.jamf.setupmanager.started",
      name: "Started",
      timestamp: new Date().toISOString(),
      started: new Date().toISOString(),
      modelName: "MacBook Pro",
      modelIdentifier: "Mac15,3",
      macOSBuild: "24A335",
      macOSVersion: "15.0",
      serialNumber: "TEST001",
      setupManagerVersion: "2.0.0",
    },
  },
];

describe("Filters - Archive Toggle (UI-01)", () => {
  it("renders Active and Archived tabs", () => {
    const onFiltersChange = vi.fn();
    const onShowArchivedChange = vi.fn();

    render(
      <Filters
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        events={mockEvents}
        showArchived={false}
        onShowArchivedChange={onShowArchivedChange}
      />
    );

    expect(screen.getByRole("tab", { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /archived/i })).toBeInTheDocument();
  });

  it("defaults to Active tab when showArchived is false", () => {
    const onFiltersChange = vi.fn();
    const onShowArchivedChange = vi.fn();

    render(
      <Filters
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        events={mockEvents}
        showArchived={false}
        onShowArchivedChange={onShowArchivedChange}
      />
    );

    const activeTab = screen.getByRole("tab", { name: /active/i });
    expect(activeTab).toHaveAttribute("data-state", "active");
  });

  it("shows Archived tab as active when showArchived is true", () => {
    const onFiltersChange = vi.fn();
    const onShowArchivedChange = vi.fn();

    render(
      <Filters
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        events={mockEvents}
        showArchived={true}
        onShowArchivedChange={onShowArchivedChange}
      />
    );

    const archivedTab = screen.getByRole("tab", { name: /archived/i });
    expect(archivedTab).toHaveAttribute("data-state", "active");
  });

  it("calls onShowArchivedChange(true) when Archived tab clicked", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const onShowArchivedChange = vi.fn();

    render(
      <Filters
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        events={mockEvents}
        showArchived={false}
        onShowArchivedChange={onShowArchivedChange}
      />
    );

    const archivedTab = screen.getByRole("tab", { name: /archived/i });
    await user.click(archivedTab);

    expect(onShowArchivedChange).toHaveBeenCalledWith(true);
  });

  it("calls onShowArchivedChange(false) when Active tab clicked from Archived view", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const onShowArchivedChange = vi.fn();

    render(
      <Filters
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        events={mockEvents}
        showArchived={true}
        onShowArchivedChange={onShowArchivedChange}
      />
    );

    const activeTab = screen.getByRole("tab", { name: /active/i });
    await user.click(activeTab);

    expect(onShowArchivedChange).toHaveBeenCalledWith(false);
  });
});

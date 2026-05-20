import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsTable } from "./EventsTable";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { StoredEvent } from "@/types";

const mockEvent: StoredEvent = {
  eventId: "test-event-1",
  timestamp: Date.now(),
  payload: {
    event: "com.jamf.setupmanager.finished",
    name: "Finished",
    timestamp: new Date().toISOString(),
    started: new Date().toISOString(),
    finished: new Date().toISOString(),
    duration: 60,
    modelName: "MacBook Pro",
    modelIdentifier: "Mac15,3",
    macOSBuild: "24A335",
    macOSVersion: "15.0",
    serialNumber: "TEST001",
    setupManagerVersion: "2.0.0",
  },
};

describe("EventsTable - Archive Buttons (UI-02, UI-03)", () => {
  it("renders archive button in Active view", () => {
    const onArchive = vi.fn();

    render(
      <TooltipProvider>
        <EventsTable
          events={[mockEvent]}
          showArchived={false}
          archivingIds={new Set()}
          onArchive={onArchive}
        />
      </TooltipProvider>
    );

    const archiveButton = screen.getByRole("button", { name: /archive/i });
    expect(archiveButton).toBeInTheDocument();
  });

  it("renders unarchive button in Archived view", () => {
    const onArchive = vi.fn();

    render(
      <TooltipProvider>
        <EventsTable
          events={[mockEvent]}
          showArchived={true}
          archivingIds={new Set()}
          onArchive={onArchive}
        />
      </TooltipProvider>
    );

    const unarchiveButton = screen.getByRole("button", { name: /unarchive/i });
    expect(unarchiveButton).toBeInTheDocument();
  });

  it("calls onArchive with eventId and index when archive button clicked", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <TooltipProvider>
        <EventsTable
          events={[mockEvent]}
          showArchived={false}
          archivingIds={new Set()}
          onArchive={onArchive}
        />
      </TooltipProvider>
    );

    const archiveButton = screen.getByRole("button", { name: /archive/i });
    await user.click(archiveButton);

    expect(onArchive).toHaveBeenCalledWith("test-event-1", 0);
  });

  it("calls onArchive with eventId and index when unarchive button clicked", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <TooltipProvider>
        <EventsTable
          events={[mockEvent]}
          showArchived={true}
          archivingIds={new Set()}
          onArchive={onArchive}
        />
      </TooltipProvider>
    );

    const unarchiveButton = screen.getByRole("button", { name: /unarchive/i });
    await user.click(unarchiveButton);

    expect(onArchive).toHaveBeenCalledWith("test-event-1", 0);
  });

  it("passes correct row index for multiple events", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    const events = [
      { ...mockEvent, eventId: "event-1" },
      { ...mockEvent, eventId: "event-2" },
      { ...mockEvent, eventId: "event-3" },
    ];

    render(
      <TooltipProvider>
        <EventsTable
          events={events}
          showArchived={false}
          archivingIds={new Set()}
          onArchive={onArchive}
        />
      </TooltipProvider>
    );

    const rows = screen.getAllByRole("row");
    // Skip header row (index 0), get second event row (index 2)
    const secondEventRow = rows[2];
    const archiveButton = within(secondEventRow).getByRole("button", { name: /archive/i });

    await user.click(archiveButton);

    // Should pass index 1 (second event in array)
    expect(onArchive).toHaveBeenCalledWith("event-2", 1);
  });
});

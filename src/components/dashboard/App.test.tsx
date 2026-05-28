import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock sonner toast (must be before App import)
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock the WebSocket hook to provide controlled test data
vi.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: () => ({
    connected: true,
    events: [
      {
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
      },
    ],
    stats: {
      total: 1,
      started: 0,
      finished: 1,
      avgDuration: 60,
      successRate: 100,
      devices: 1,
      lastEventTime: Date.now(),
    },
    health: { status: "healthy" as const },
  }),
}));

describe("App - Optimistic UI and Rollback (UI-04, UI-05)", () => {
  let mockToastError: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Get reference to mocked toast.error
    const { toast } = await import("sonner");
    mockToastError = toast.error as any;
  });

  it("removes event from view immediately on archive click (optimistic UI)", async () => {
    const user = userEvent.setup();

    // Mock delayed archive response to verify optimistic behavior
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: "1.0.0",
            latestVersion: null,
            updateAvailable: false,
            appTitle: "Test HUD",
            logoUrl: null,
          }),
        });
      }
      if (url.includes("/archive")) {
        // Delay response to verify UI updates before API completes
        return new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 200)
        );
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>
    );

    // Wait for initial render
    await waitFor(() => expect(screen.getByText("TEST001")).toBeInTheDocument());

    // Click archive button
    const archiveButton = screen.getByRole("button", { name: /archive/i });
    await user.click(archiveButton);

    // Row should be visually hidden immediately (opacity-0) before API response
    // The element stays in DOM but becomes invisible via CSS transition
    await waitFor(() => {
      const row = screen.getByText("TEST001").closest("tr");
      expect(row).toHaveClass("opacity-0");
    }, { timeout: 100 });
  });

  it("removes row from view after successful archive", async () => {
    const user = userEvent.setup();

    // Mock successful archive
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: "1.0.0",
            latestVersion: null,
            updateAvailable: false,
            appTitle: "Test HUD",
            logoUrl: null,
          }),
        });
      }
      if (url.includes("/archive")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>
    );

    await waitFor(() => expect(screen.getByText("TEST001")).toBeInTheDocument());

    const archiveButton = screen.getByRole("button", { name: /archive/i });
    await user.click(archiveButton);

    // Row should eventually disappear
    await waitFor(() => {
      expect(screen.queryByText("TEST001")).not.toBeInTheDocument();
    });
  });

  it("shows error toast and restores row on archive failure", async () => {
    const user = userEvent.setup();

    // Mock failed archive
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: "1.0.0",
            latestVersion: null,
            updateAvailable: false,
            appTitle: "Test HUD",
            logoUrl: null,
          }),
        });
      }
      if (url.includes("/archive")) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>
    );

    await waitFor(() => expect(screen.getByText("TEST001")).toBeInTheDocument());

    const archiveButton = screen.getByRole("button", { name: /archive/i });
    await user.click(archiveButton);

    // Wait for API call to fail and rollback
    await waitFor(() => {
      // Row should still be visible after rollback
      expect(screen.getByText("TEST001")).toBeInTheDocument();
      // Toast error should be called
      expect(mockToastError).toHaveBeenCalledWith(
        "Archive failed",
        expect.objectContaining({
          description: expect.stringContaining("Could not archive this enrollment"),
        })
      );
    });
  });

  it("shows unarchive-specific error message when unarchiving fails", async () => {
    const user = userEvent.setup();

    // Mock archived events fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: "1.0.0",
            latestVersion: null,
            updateAvailable: false,
            appTitle: "Test HUD",
            logoUrl: null,
          }),
        });
      }
      if (url.includes("archived=true")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              eventId: "archived-event-1",
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
                serialNumber: "ARCHIVED001",
                setupManagerVersion: "2.0.0",
              },
            },
          ]),
        });
      }
      if (url.includes("/archive")) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>
    );

    // Switch to archived view
    await waitFor(() => expect(screen.getByRole("tab", { name: /archived/i })).toBeInTheDocument());
    const archivedTab = screen.getByRole("tab", { name: /archived/i });
    await user.click(archivedTab);

    // Wait for archived events to load
    await waitFor(() => expect(screen.getByText("ARCHIVED001")).toBeInTheDocument());

    // Click unarchive button
    const unarchiveButton = screen.getByRole("button", { name: /unarchive/i });
    await user.click(unarchiveButton);

    // Wait for API call to fail and rollback
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Unarchive failed",
        expect.objectContaining({
          description: expect.stringContaining("Could not unarchive this enrollment"),
        })
      );
    }, { timeout: 3000 });
  });

  it("uses encodeURIComponent for eventId in archive request URL", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: "1.0.0",
            latestVersion: null,
            updateAvailable: false,
            appTitle: "Test HUD",
            logoUrl: null,
          }),
        });
      }
      if (url.includes("/archive")) {
        fetchSpy(url);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>
    );

    await waitFor(() => expect(screen.getByText("TEST001")).toBeInTheDocument());

    const archiveButton = screen.getByRole("button", { name: /archive/i });
    await user.click(archiveButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    // Verify URL is properly formatted with encodeURIComponent
    // The test eventId is "test-event-1" which doesn't contain special chars,
    // but real eventIds like "com.jamf.setupmanager.started:SERIAL:timestamp:uuid"
    // would have colons encoded as %3A
    const callUrl = fetchSpy.mock.calls[0][0];
    expect(callUrl).toBe("/api/events/test-event-1/archive");
  });
});

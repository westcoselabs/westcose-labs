import { useRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEvasiveControl } from "@/components/ui/useEvasiveControl";
import { Button } from "@/components/ui";

function Control({
  activate,
  reduced = false,
  disabled = false,
  maxEvasions = 2,
  touchEvasions = 1,
  maxTotalEvasions,
  onEvade,
  distance = 60,
  bounded = false,
}: {
  activate: () => void;
  reduced?: boolean;
  disabled?: boolean;
  maxEvasions?: number;
  touchEvasions?: number;
  maxTotalEvasions?: number;
  onEvade?: (count: number) => void;
  distance?: number;
  bounded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const behavior = useEvasiveControl({
    onActivate: activate,
    reducedMotion: reduced,
    disabled,
    maxEvasions,
    touchEvasions,
    maxTotalEvasions,
    onEvade,
    distance,
    containerRef: bounded ? containerRef : undefined,
  });
  return (
    <div ref={containerRef} data-testid="bounds">
      <Button {...behavior} disabled={disabled}>
        Danger
      </Button>
    </div>
  );
}
function pointer(button: HTMLElement, type: string, pointerType: string) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(button, event);
}
function mockRect(
  element: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  vi.spyOn(element, "getBoundingClientRect").mockImplementation(() => {
    // The browser includes the current transform in getBoundingClientRect.
    const [, x = "0", y = "0"] =
      element.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/) ?? [];
    return new DOMRect(left + Number(x), top + Number(y), width, height);
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("evasive controls", () => {
  it("caps a shared budget at three dodges even when switching input devices", () => {
    const activate = vi.fn();
    const onEvade = vi.fn();
    render(<Control activate={activate} maxEvasions={3} touchEvasions={3} maxTotalEvasions={3} onEvade={onEvade} />);
    const button = screen.getByRole("button");
    mockRect(button, 200, 200, 100, 40);
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    pointer(button, "pointerout", "mouse");
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    pointer(button, "pointerout", "mouse");
    expect(onEvade.mock.calls).toEqual([[1], [2], [3]]);
    expect(activate).not.toHaveBeenCalled();
    const finalPosition = button.style.transform;
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    expect(button.style.transform).toBe(finalPosition);
    expect(onEvade).toHaveBeenCalledTimes(3);
    expect(activate).toHaveBeenCalledOnce();
  });
  it("evades two mouse approaches, then gives up", () => {
    const activate = vi.fn();
    render(<Control activate={activate} />);
    const button = screen.getByRole("button");
    for (let i = 0; i < 2; i++) {
      pointer(button, "pointerover", "mouse");
      fireEvent.click(button, { detail: 1 });
      pointer(button, "pointerout", "mouse");
    }
    expect(activate).not.toHaveBeenCalled();
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("allows the second touch and never interferes with keyboard activation", () => {
    const activate = vi.fn();
    render(<Control activate={activate} />);
    const button = screen.getByRole("button");
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    expect(activate).not.toHaveBeenCalled();
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
    fireEvent.click(button, { detail: 0 });
    expect(activate).toHaveBeenCalledTimes(2);
  });
  it("does not move or evade with reduced motion", () => {
    const activate = vi.fn();
    render(<Control activate={activate} reduced />);
    const button = screen.getByRole("button");
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
    expect(button.style.transform).toBe("");
  });
  it("discards old movement on a live reduced-motion change and reclamps when enabled again", () => {
    let resize: (() => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { resize = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const activate = vi.fn();
    const view = render(<Control activate={activate} bounded />);
    const button = screen.getByRole("button");
    const containerRect = vi.spyOn(screen.getByTestId("bounds"), "getBoundingClientRect");
    containerRect.mockReturnValue(new DOMRect(100, 60, 300, 160));
    mockRect(button, 220, 100, 100, 40);
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(60px, -20px)" });
    view.rerender(<Control activate={activate} bounded reduced />);
    expect(button.style.transform).toBe("");
    expect(disconnect).toHaveBeenCalledOnce();
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledOnce();
    containerRect.mockReturnValue(new DOMRect(100, 60, 200, 160));
    view.rerender(<Control activate={activate} bounded />);
    expect(button).toHaveStyle({ transform: "translate(0px, 0px)" });
    expect(observe).toHaveBeenCalledTimes(4);
    // ResizeObserver delivers current geometry after observe(), even if the
    // container resized while motion and its subscriptions were disabled.
    act(() => resize?.());
    expect(button).toHaveStyle({ transform: "translate(-20px, 0px)" });
    expect(button.getBoundingClientRect().right).toBe(300);
  });
  it("immediately allows keyboard activation even while a pointer evasion is pending", () => {
    const activate = vi.fn();
    render(<Control activate={activate} />);
    const button = screen.getByRole("button");
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 0 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("still counts mouse attempts when a short move leaves the pointer inside the button", () => {
    const activate = vi.fn();
    render(<Control activate={activate} />);
    const button = screen.getByRole("button");
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    fireEvent.click(button, { detail: 1 });
    expect(activate).not.toHaveBeenCalled();
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("keeps mouse and touch limits independent on hybrid devices", () => {
    const activate = vi.fn();
    render(<Control activate={activate} />);
    const button = screen.getByRole("button");
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    for (let attempt = 0; attempt < 2; attempt++) {
      pointer(button, "pointerover", "mouse");
      fireEvent.click(button, { detail: 1 });
      pointer(button, "pointerout", "mouse");
    }
    expect(activate).not.toHaveBeenCalled();
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("supports a different evasion budget and movement distance", () => {
    const activate = vi.fn();
    render(<Control activate={activate} maxEvasions={1} distance={24} />);
    const button = screen.getByRole("button");
    mockRect(button, 100, 100, 100, 40);
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(24px, -8px)" });
    fireEvent.click(button, { detail: 1 });
    pointer(button, "pointerout", "mouse");
    pointer(button, "pointerover", "mouse");
    fireEvent.click(button, { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("keeps the whole control within the intersection of viewport and container", () => {
    render(<Control activate={vi.fn()} bounded />);
    const button = screen.getByRole("button");
    const right = window.innerWidth - 8;
    mockRect(screen.getByTestId("bounds"), right - 160, -20, 200, 220);
    mockRect(button, right - 120, 20, 100, 40);
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(20px, -12px)" });
    fireEvent.click(button, { detail: 1 });
    pointer(button, "pointerout", "mouse");
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(-40px, 8px)" });
    const rect = button.getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(right - 160);
    expect(rect.right).toBeLessThanOrEqual(right);
    expect(rect.top).toBeGreaterThanOrEqual(8);
    expect(rect.bottom).toBeLessThanOrEqual(200);
  });
  it("does not push an oversized control farther outside its container", () => {
    render(<Control activate={vi.fn()} bounded />);
    const button = screen.getByRole("button");
    mockRect(screen.getByTestId("bounds"), 150, 60, 80, 160);
    mockRect(button, 100, 100, 180, 40);
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(0px, -20px)" });
  });
  it("brings a dodged control back inside a resized viewport", () => {
    render(<Control activate={vi.fn()} />);
    const button = screen.getByRole("button");
    mockRect(button, 200, 100, 80, 40);
    pointer(button, "pointerover", "mouse");
    expect(button).toHaveStyle({ transform: "translate(60px, -20px)" });
    vi.stubGlobal("innerWidth", 300);
    fireEvent(window, new Event("resize"));
    expect(button.getBoundingClientRect().right).toBe(292);
  });
  it("constrains container resizes and disposes its resize subscriptions", () => {
    let resize: (() => void) | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { resize = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const removeListener = vi.spyOn(window, "removeEventListener");
    const view = render(<Control activate={vi.fn()} bounded />);
    const button = screen.getByRole("button");
    const container = screen.getByTestId("bounds");
    const containerRect = vi.spyOn(container, "getBoundingClientRect");
    containerRect.mockReturnValue(new DOMRect(100, 60, 300, 160));
    mockRect(button, 180, 100, 100, 40);
    pointer(button, "pointerover", "mouse");
    containerRect.mockReturnValue(new DOMRect(100, 60, 200, 160));
    act(() => resize?.());
    expect(button.getBoundingClientRect().right).toBe(300);
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith("resize", resize);
  });
  it("starts a fresh evasion budget after the completed joke remounts", () => {
    const activate = vi.fn();
    const view = render(<Control activate={activate} />);
    pointer(screen.getByRole("button"), "pointerdown", "touch");
    fireEvent.click(screen.getByRole("button"), { detail: 1 });
    pointer(screen.getByRole("button"), "pointerdown", "touch");
    fireEvent.click(screen.getByRole("button"), { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
    view.unmount();
    render(<Control activate={activate} />);
    pointer(screen.getByRole("button"), "pointerdown", "touch");
    fireEvent.click(screen.getByRole("button"), { detail: 1 });
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it("never activates or moves a disabled control", () => {
    const activate = vi.fn();
    render(<Control activate={activate} disabled />);
    const button = screen.getByRole("button");
    pointer(button, "pointerdown", "touch");
    fireEvent.click(button, { detail: 1 });
    fireEvent.click(button, { detail: 0 });
    expect(button).toHaveStyle({ transform: "translate(0px, 0px)" });
    expect(activate).not.toHaveBeenCalled();
  });
});

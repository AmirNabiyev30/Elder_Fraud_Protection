import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import Home from "../pages/Home";

const getTokenMock = vi.fn();
const scanEmailMock = vi.fn();
let isAuthLoadedMock = true;
let isSignedInMock = true;
const localStorageValues = new Map();
const localStorageMock = {
  getItem: vi.fn((key) => localStorageValues.get(key) ?? null),
  setItem: vi.fn((key, value) => {
    localStorageValues.set(key, String(value));
  }),
  removeItem: vi.fn((key) => {
    localStorageValues.delete(key);
  }),
  clear: vi.fn(() => {
    localStorageValues.clear();
  }),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: (...args) => getTokenMock(...args),
    isLoaded: isAuthLoadedMock,
    isSignedIn: isSignedInMock,
  }),
}));

vi.mock("../lib/authApi", () => ({
  scanEmail: (...args) => scanEmailMock(...args),
}));

beforeEach(() => {
  getTokenMock.mockReset();
  scanEmailMock.mockReset();
  isAuthLoadedMock = true;
  isSignedInMock = true;
  window.localStorage.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

function renderHome() {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>,
  );
}

test("renders home page for an authenticated user", () => {
  renderHome();

  expect(screen.getByText("Scan New Email")).toBeTruthy();
  expect(screen.getByLabelText("Paste email content here")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Analyze Email" })).toBeTruthy();
});

test("authenticated user can analyze text and see detailed results", async () => {
  getTokenMock.mockResolvedValue("test-clerk-token");
  scanEmailMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      pred_label: "phishing",
      pred_score: 98.5,
      summary: "This message appears high risk and may be phishing.",
      red_flags: [
        "The sender pressures you to act immediately.",
        "The message requests account verification through a link.",
      ],
      next_steps: [
        "Do not click the link in the message.",
        "Contact the company through its official website.",
      ],
      explanation: "The message combines urgency with a request for sensitive action.",
    }),
  });

  renderHome();

  fireEvent.change(screen.getByLabelText("Paste email content here"), {
    target: { value: "Your account is locked. Verify immediately." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Analyze Email" }));

  await waitFor(() => {
    expect(scanEmailMock).toHaveBeenCalledWith(expect.any(Function), "Your account is locked. Verify immediately.");
  });

  expect(await screen.findByText("Analysis Summary")).toBeTruthy();
  expect(screen.getByText("High Risk: Phishing")).toBeTruthy();
  expect(screen.getByText("This message appears high risk and may be phishing.")).toBeTruthy();
  expect(screen.getByText("The sender pressures you to act immediately.")).toBeTruthy();
  expect(screen.getByText("The message combines urgency with a request for sensitive action.")).toBeTruthy();
  expect(screen.getByText("Do not click the link in the message.")).toBeTruthy();
});

test("guest user gets one scan and then is prompted to sign in on the next attempt", async () => {
  isSignedInMock = false;
  getTokenMock.mockResolvedValue(null);
  scanEmailMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      pred_label: "spam",
      pred_score: 76.2,
      summary: "This message appears likely to be spam.",
      red_flags: ["The message uses mass-marketing language."],
      next_steps: ["Delete or report the message if it looks suspicious."],
      explanation: "The content matches common spam patterns.",
    }),
  });

  renderHome();

  fireEvent.change(screen.getByLabelText("Paste email content here"), {
    target: { value: "Limited time offer just for you." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Analyze Email" }));

  await waitFor(() => {
    expect(scanEmailMock).toHaveBeenCalledTimes(1);
  });

  expect(await screen.findByText("Your free guest scan has been used.")).toBeTruthy();
  expect(window.localStorage.getItem("guest_scan_used")).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: "Analyze Email" }));

  await waitFor(() => {
    expect(scanEmailMock).toHaveBeenCalledTimes(1);
  });

  expect(screen.getByText("Please sign in to keep analyzing more messages.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Sign in to continue" })).toBeTruthy();
});

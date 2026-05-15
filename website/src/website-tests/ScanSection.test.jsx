import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import ScanSection from "../components/ScanSection";

test("disables analyze button until text is entered", () => {
  render(
    <BrowserRouter>
      <ScanSection
        onAnalyze={vi.fn()}
        isSubmitting={false}
        errorMessage=""
        isSignedIn={true}
        showLoginPrompt={false}
      />
    </BrowserRouter>,
  );

  expect(screen.getByRole("button", { name: "Analyze Email" }).disabled).toBe(true);

  fireEvent.change(screen.getByLabelText("Paste email content here"), {
    target: { value: "Please verify your bank account." },
  });

  expect(screen.getByRole("button", { name: "Analyze Email" }).disabled).toBe(false);
});

test("submits textarea text to the analyze handler", async () => {
  const onAnalyzeMock = vi.fn().mockResolvedValue(undefined);

  render(
    <BrowserRouter>
      <ScanSection
        onAnalyze={onAnalyzeMock}
        isSubmitting={false}
        errorMessage=""
        isSignedIn={true}
        showLoginPrompt={false}
      />
    </BrowserRouter>,
  );

  fireEvent.change(screen.getByLabelText("Paste email content here"), {
    target: { value: "Your account is suspended. Click here." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Analyze Email" }));

  expect(onAnalyzeMock).toHaveBeenCalledWith("Your account is suspended. Click here.");
});

test("shows login prompt after guest usage is exhausted", () => {
  render(
    <BrowserRouter>
      <ScanSection
        onAnalyze={vi.fn()}
        isSubmitting={false}
        errorMessage="Please sign in to keep analyzing more messages."
        isSignedIn={false}
        showLoginPrompt={true}
      />
    </BrowserRouter>,
  );

  expect(screen.getByText("Your free guest scan has been used.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Sign in to continue" })).toBeTruthy();
});

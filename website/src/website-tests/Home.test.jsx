import Home from "../pages/Home";
import {render} from "@testing-library/react"
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: async () => "test-clerk-token",
    isLoaded: true,
    isSignedIn: true,
  }),
}));

test('renders Home page', () =>{
    render(
      <BrowserRouter>
        <Home/>
      </BrowserRouter>
    )
})
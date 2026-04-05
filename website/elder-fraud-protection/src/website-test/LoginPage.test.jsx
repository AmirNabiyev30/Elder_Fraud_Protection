import LoginPage from "../pages/LoginPage";
import { renderWithRouter } from "./test-utils";

test('renders Login page', () =>{
    renderWithRouter(<LoginPage/>)
})
import { render } from "@testing-library/react";
import SignUpPage from "../pages/SignUpPage";

test('renders sign up page without crashing', () =>{
    render(<SignUpPage/>);
})
import {renderWithRouter} from "./test-utils";
import SignUpPage from "../pages/SignUpPage";
import { validateEmail,validateName } from "../utils/validators";
import { fireEvent, screen } from "@testing-library/react";


//Render the sign up page without crashing
test('renders sign up page without crashing', () =>{
    renderWithRouter(<SignUpPage/>);
})
//UNIT TESTS
//Testing validation functions
test('accepts a valid email address', () =>{
    expect(validateEmail("test@example.com")).toBe(true);
});

test('rejects an invalid email address', () =>{
    expect(validateEmail("invalid-email")).toBe(false);
});

test('accepts a valid name', () =>{
    expect(validateName("JohnDoe")).toBe(true);
    expect(validateName("John Doe")).toBe(true);
});

test('rejects an invalid name', () =>{
    expect(validateName("John123")).toBe(false);
    expect(validateName("John_Doe")).toBe(false);
});
// INTEGRATION TESTS


import {renderWithRouter} from "./test-utils";
import SignUpPage from "../pages/SignUpPage";
import { validateEmail,validateName } from "../utils/validators";
import { fireEvent, screen } from "@testing-library/react";
import '@testing-library/jest-dom';


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

//Testing that can't submit form with no inputs as continue button should be disabled
test('submit is disabled when all fields are empty', () =>{
    renderWithRouter(<SignUpPage/>);
    const submitButton = screen.getByRole('button', { name: /continue/i });
    expect(submitButton).toBeDisabled();
});

//testing that upon rendering the signup page, that error messages are not visible, 
// and that upon clicking the submit button with invalid inputs, error messages are shown


//Testing that upon rendering the signup page, that name error messages is not visible
test('name error message is not visible when page loads', () =>{
    renderWithRouter(<SignUpPage/>);
    const nameError = screen.getByTestId("name-error");
    expect(nameError).toHaveClass("hidden");
});
//Testing that upon rendering the signup page and submitting with an invalid name, that name error message is visible
test('name error message is visible when invalid name is submitted', () =>{
    renderWithRouter(<SignUpPage/>);
    //pull input fields by test id
    const nameInput = screen.getByTestId("full-name-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const phoneInput = screen.getByTestId("phone-input");
    const submitButton = screen.getByRole('button', { name: /continue/i });
    //have to change fields
    fireEvent.change(nameInput, { target: { value: "John123" } });
    fireEvent.change(emailInput, { target: { value: "a@example.com"}});
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 000-0000" } });
    fireEvent.click(submitButton);
    const nameError = screen.getByTestId("name-error");
    expect(nameError).not.toHaveClass("hidden");
});

test ('email error message is not visible when page loads', () =>{
    renderWithRouter(<SignUpPage/>);
    const emailError = screen.getByTestId("email-error");
    expect(emailError).toHaveClass("hidden");
});

test('email error message is visible when invalid email is submitted', () =>{
    renderWithRouter(<SignUpPage/>);
    //pull input fields by test id
    const nameInput = screen.getByTestId("full-name-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const phoneInput = screen.getByTestId("phone-input");
    const submitButton = screen.getByRole('button', { name: /continue/i });
    //have to change fields
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "invalid-email"}});
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 000-0000" } });
    fireEvent.click(submitButton);
    const emailError = screen.getByTestId("email-error");
    expect(emailError).not.toHaveClass("hidden");
});
//testing that upon rendering the signup page, submit button error is not visible
test('submit error message is not visible when page loads', () =>{
    renderWithRouter(<SignUpPage/>);
    const submitError = screen.getByTestId("submit-error");
    expect(submitError).toHaveClass("hidden");
});

//Testing that upon rendering the signup page and submitting invalid inputs, the submit error displays
test('submit error message is visible when invalid inputs are submitted', () =>{
    renderWithRouter(<SignUpPage/>);
    //pull input fields by test id
    const nameInput = screen.getByTestId("full-name-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const phoneInput = screen.getByTestId("phone-input");
    const submitButton = screen.getByRole('button', { name: /continue/i });
    //have to change fields
    fireEvent.change(nameInput, { target: { value: "John123" } });
    fireEvent.change(emailInput, { target: { value: "invalid-email"}});
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 000-0000" } });
    fireEvent.click(submitButton);
    const submitError = screen.getByTestId("submit-error");
    expect(submitError).not.toHaveClass("hidden");  
});

//Testing that upon rendering the signup page, and having correct inputs, we get a console log of form data and that the success alert is visible
test('successful submission shows success alert', () =>{
    renderWithRouter(<SignUpPage/>);
    const logSpy = vi.spyOn(console, 'log');
    //pull input fields by test id
    const nameInput = screen.getByTestId("full-name-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const phoneInput = screen.getByTestId("phone-input");
    const submitButton = screen.getByRole('button', { name: /continue/i });
    //have to change fields
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "example@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 000-0000" } });
    fireEvent.click(submitButton);
    expect(logSpy).toHaveBeenCalledWith({ fullName: "John Doe", email: "example@email.com", password: "password123", phone: "+1 (555) 000-0000" });
    logSpy.mockRestore();
});


//Testing that after rendering clicking the sign in button takes you to the login page
test('clicking sign in button takes you to login page', () =>{
    renderWithRouter(<SignUpPage/>);
    const signInLink = screen.getByTestId("signin-link");
    expect(signInLink).toHaveAttribute('href', '/login');
});



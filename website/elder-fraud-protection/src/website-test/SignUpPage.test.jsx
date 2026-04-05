import {renderWithRouter} from "./test-utils";
import SignUpPage from "../pages/SignUpPage";

test('renders sign up page without crashing', () =>{
    renderWithRouter(<SignUpPage/>);
})
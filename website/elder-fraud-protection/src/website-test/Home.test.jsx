import Home from "../pages/Home";
import {renderWithRouter} from "./test-utils";

test('renders Home page', () =>{
    renderWithRouter(<Home/>)
})
import {renderWithRouter} from "./test-utils";
import Footer from "../components/Footer";

test('renders Footer without crashing', () => {
    renderWithRouter(<Footer/>);
});
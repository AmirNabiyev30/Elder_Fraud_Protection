import { renderWithRouter } from "./test-utils";
import ScanSection from "../components/ScanSection";

test('renders Scan Section without crashing', () =>{
    renderWithRouter(<ScanSection/>);
})
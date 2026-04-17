import { renderWithRouter } from './test-utils';
import Navbar from '../components/Navbar';

test('renders NavBar without crashing', () =>{
    renderWithRouter(<Navbar/>);
});
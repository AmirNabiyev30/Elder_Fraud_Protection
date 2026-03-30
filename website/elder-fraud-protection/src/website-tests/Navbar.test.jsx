import {render} from '@testing-library/react';
import Navbar from '../components/Navbar';

test('renders without crashing', () =>{
    render(<Navbar/>);
});
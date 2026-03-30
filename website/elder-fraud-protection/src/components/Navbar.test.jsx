import {render} from '@testing-library/react';
import Navbar from './Navbar';

test('renders without crashing', () =>{
    render(<Navbar/>);
});
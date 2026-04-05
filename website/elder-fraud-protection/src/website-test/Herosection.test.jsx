import HeroSection from '../components/Herosection';
import { renderWithRouter } from './test-utils';

test('renders Hero Section without crashing', () =>{
    renderWithRouter(<HeroSection/>);
});
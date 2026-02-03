
import { Car } from './types';

// Mock data purged. The system now relies exclusively on dbService for live data.
export const MOCK_CARS: Car[] = [];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
];

export const FOOTER_LINKS = {
  general: [
    { name: 'Home', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ],
  services: [
    { name: 'Financing', path: '/financing' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ],
  account: [
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' }
  ]
};

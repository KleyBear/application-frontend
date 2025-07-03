import CIcon from '@coreui/icons-react'
import { cilBasket, cilChartPie, cilHome, cilNotes, cilSettings, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  //my nav camila
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Inventory',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Products',
        to: '/products',
      },
      // {
      //   component: CNavItem,
      //   name: 'Providers',
      //   to: '/suppliers',
      // },
    ],
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Sales',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'new Sale',
        to: '/salesPage',
      },
      {
        component: CNavItem,
        name: 'Sales History',
        to: '/salesHistory',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Accounts',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Account Receivable',
        to: '/accountReceivable',
      },
      {
        component: CNavItem,
        name: 'Account Payable',
        to: '/investment',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'General',
        to: '/setting/general',
      },
      {
        component: CNavItem,
        name: 'Profile',
        to: '/setting/profile',
      },
      {
        component: CNavItem,
        name: 'Notifications',
        to: '/setting/notifications',
      },
    ],
  },
]

export default _nav

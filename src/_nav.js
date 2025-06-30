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
    component: CNavItem,
    name: 'Products',
    to: '/products',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/Users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Sales',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'newSale',
        to: '/newSale',
      },
      {
        component: CNavItem,
        name: 'sales history',
        to: '/setting/profile',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Investment',
    to: '/investment',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Suppliers',
    to: '/suppliers',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
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

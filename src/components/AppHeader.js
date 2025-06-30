import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler, CNavItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilMenu } from '@coreui/icons'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import ModalVerticallyCenteredScrollableExample from './NotificationModal.js'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const [isModalVisible, setModalVisible] = useState(false)
  const [notifications, setNotifications] = useState([
    { type: 'Pending debts', count: 3 },
    { type: 'Payroll', count: 2 },
    { type: 'Product shortage', count: 5 },
    { type: 'Accounts receivable', count: 1 },
  ]) // Lista de notificaciones con categorías y conteos

  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <>
      <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
        <CContainer className="border-bottom px-4" fluid>
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ marginInlineStart: '-14px' }}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>
          <CHeaderNav className="ms-auto">
            <CNavItem>
              <CIcon icon={cilBell} size="lg" style={{ cursor: 'pointer' }} onClick={toggleModal} />
            </CNavItem>
          </CHeaderNav>
          <CHeaderNav>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <AppHeaderDropdown />
          </CHeaderNav>
        </CContainer>
      </CHeader>
      <ModalVerticallyCenteredScrollableExample
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        notifications={notifications} // Pasar notificaciones al modal
      />
    </>
  )
}

export default AppHeader

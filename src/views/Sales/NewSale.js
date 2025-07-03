import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardImage,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CFormInput,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart } from '@coreui/icons'
import SaleFormDrawer from './SaleFormDrawer.js'

const API_BASE = 'http://localhost:4000/api'

const NewSale = () => {
  const [productsByCategory, setProductsByCategory] = useState({})
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando fetchData...')
        const token = localStorage.getItem('token')
        console.log('Token encontrado:', token)

        if (!token) {
          throw new Error('No hay token disponible.')
        }

        console.log('Haciendo fetch a categoría y productos...')
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/category`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        console.log('Respuestas:', catRes.status, prodRes.status)

        if (!catRes.ok || !prodRes.ok) {
          throw new Error('Error al obtener datos del servidor.')
        }

        const catData = await catRes.json()
        const prodData = await prodRes.json()

        console.log('Datos recibidos:', catData, prodData)

        const categoriesData = (catData.data || []).map((cat) => ({
          ...cat,
          name_category: cat.name,
        }))
        const productsData = prodData.data || []

        const grouped = {}
        categoriesData.forEach((category) => {
          grouped[category.id] = {
            category,
            products: productsData.filter((p) => p.id_category === category.id),
          }
        })

        setCategories(categoriesData)
        setProductsByCategory(grouped)
        console.log('Datos procesados y estado actualizado.')
      } catch (err) {
        console.error('Error al cargar categorías/productos:', err)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = (catId) => {
    const all = productsByCategory[catId]?.products || []
    return all.filter((p) =>
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const addProductToCart = (product) => {
    const price = parseFloat(product.price_sale)
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.id === product.id)
      if (index !== -1) {
        const updated = [...prev]
        updated[index].amount += 1
        updated[index].subtotal = updated[index].amount * price
        return updated
      } else {
        return [...prev, { ...product, price_sale: price, amount: 1, subtotal: price }]
      }
    })
    setDrawerVisible(true)
  }

  return (
    <div>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <CDropdown>
              <CDropdownToggle
                style={{
                  background: 'linear-gradient(90deg, #D13FFF 0%,rgb(255, 77, 110) 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '25px',
                  padding: '8px 10px',
                  fontWeight: 'bold',
                }}
              >
                {selectedCategory ? selectedCategory.name_category : 'Buscar categoría'}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setSelectedCategory(null)}>Todas</CDropdownItem>
                {categories.map((cat) => (
                  <CDropdownItem key={cat.id} onClick={() => setSelectedCategory(cat)}>
                    {cat.name_category}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>

            <CFormInput
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
          </div>
        </CCardHeader>

        <CCardBody>
          <CRow className="gap-2">
            {(selectedCategory ? [selectedCategory] : categories).map((cat) =>
              filteredProducts(cat.id).map((product) => (
                <CCol key={product.id} xs="6" sm="4" md="3" lg="2">
                  <CCard className="p-2 shadow-sm border-0 rounded-3 text-center">
                    <CCardImage
                      src={cat.image || 'https://via.placeholder.com/100'}
                      style={{ height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div className="mt-2">
                      <strong className="d-block">{product.description}</strong>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-primary fw-bold">${product.price_sale}</span>
                        <small className="text-muted">{product.stock} Und.</small>
                      </div>
                      <CFormSelect
                        size="sm"
                        className="my-2"
                        options={['Seleccionar', 'S', 'M', 'L', 'XL']}
                      />
                      <CButton
                        color="primary"
                        size="sm"
                        className="w-100 text-white"
                        onClick={() => addProductToCart(product)}
                      >
                        <CIcon icon={cilCart} className="me-2" />
                        Añadir al carrito
                      </CButton>
                    </div>
                  </CCard>
                </CCol>
              ))
            )}
          </CRow>
        </CCardBody>
      </CCard>

      <CButton
        shape="rounded-circle"
        size="lg"
        onClick={() => setDrawerVisible(!drawerVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1300,
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          background: 'linear-gradient(90deg, #D13FFF 0%, #FF4D8D 100%)',
        }}
      >
        <CIcon icon={cilCart} size="xl" />
      </CButton>

      <SaleFormDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
      />
    </div>
  )
}

export default NewSale

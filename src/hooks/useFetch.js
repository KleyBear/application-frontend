import { useState, useEffect } from 'react'

const useFetch = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') // ← obtenemos el token del localStorage

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // ← incluimos el token
          },
        })

        if (!response.ok) {
          throw new Error('Error al obtener los datos')
        }

        const result = await response.json()
        setData(result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

export default useFetch

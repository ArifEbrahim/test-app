import { useState } from 'react'

interface APIData {
  name: string
}

function Home() {
  const [userText, setUserText] = useState('')
  const [data, setData] = useState<APIData>()
  const [isError, setIsError] = useState<boolean>(false)
  const BASE_URL = 'https://swapi.dev/api/'

  const handleClick = async () => {
    setIsError(false)
    setData({ name: '' })
    try {
      if (!userText) return
      const updatedURL = `${BASE_URL}${userText}`
      const response = await fetch(updatedURL)
      const responseJson = await response.json()
      setData(responseJson)
    } catch (error) {
      setIsError(true)
    }
  }

  return (
    <>
      <label htmlFor="text-input">
        Enter search term
        <input
          id="text-input"
          type="text"
          value={userText}
          onChange={e => setUserText(e.target.value)}
        />
      </label>
      <button type="button" onClick={handleClick}>
        Request
      </button>
      {data?.name && <p>{data?.name}</p>}
      {isError && <p>oops something went wrong!</p>}
    </>
  )
}
export default Home

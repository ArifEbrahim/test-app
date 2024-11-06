import Home from '.'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockFetch = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ json: () => Promise.resolve({ name: 'test' }) })
  )

describe('Home', () => {
  it('has a text input field with a label', () => {
    render(<Home />)
    const input = screen.getByLabelText('Enter search term')
    expect(input).toBeInTheDocument()
  })

  it('has a button to submit data', () => {
    render(<Home />)
    const btn = screen.getByRole('button', { name: 'Request' })
    expect(btn).toBeInTheDocument()
  })

  it('does not call the api if text input is blank', async () => {
    global.fetch = mockFetch
    const user = userEvent.setup()
    render(<Home />)
    const btn = screen.getByRole('button', { name: 'Request' })
    await user.click(btn)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls the API on click with the correct data', async () => {
    global.fetch = mockFetch
    const user = userEvent.setup()
    const URL = 'https://swapi.dev/api/people/1'
    render(<Home />)
    const btn = screen.getByRole('button', { name: 'Request' })
    const input = screen.getByLabelText('Enter search term')
    await user.type(input, 'people/1')
    await user.click(btn)
    expect(mockFetch).toHaveBeenCalledWith(URL)
  })

  it('displays response data correctly', async () => {
    global.fetch = mockFetch
    const user = userEvent.setup()
    render(<Home />)
    const input = screen.getByLabelText('Enter search term')
    await user.type(input, 'foo')
    const btn = screen.getByRole('button', { name: 'Request' })
    await user.click(btn)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('throws when API returns an error', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject())
    const user = userEvent.setup()
    render(<Home />)
    const input = screen.getByLabelText('Enter search term')
    await user.type(input, 'foo')
    const btn = screen.getByRole('button', { name: 'Request' })
    await user.click(btn)
    expect(screen.getByText('oops something went wrong!')).toBeInTheDocument()
  })

  it('removes error message when another request is made', async () => {
    // create error
    global.fetch = jest.fn().mockImplementation(() => Promise.reject())
    const user = userEvent.setup()
    render(<Home />)
    const input = screen.getByLabelText('Enter search term')
    await user.type(input, 'foo')
    const btn = screen.getByRole('button', { name: 'Request' })
    await user.click(btn)

    // make new request
    global.fetch = mockFetch
    await user.click(btn)

    // check that the error message is not displayed
    expect(
      screen.queryByText('oops something went wrong!')
    ).not.toBeInTheDocument()
  })

  it('removes previous result from display when a request is rejected', async () => {
    // get and display response
    global.fetch = mockFetch
    const user = userEvent.setup()
    render(<Home />)
    const input = screen.getByLabelText('Enter search term')
    await user.type(input, 'foo')
    const btn = screen.getByRole('button', { name: 'Request' })
    await user.click(btn)

    // make new request
    global.fetch = jest.fn().mockImplementation(() => Promise.reject())
    await user.click(btn)

    // check that previous result is not displayed
    expect(screen.queryByText('test')).not.toBeInTheDocument()
  })

  // test that previous response is replaced by new response:
})

import Home from '.'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockFetch = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ json: () => Promise.resolve({ name: 'test' }) })
  )

describe('Home', () => {
  const getElements = () => {
    const btn = screen.getByRole('button', { name: 'Request' })
    const input = screen.getByLabelText('Enter search term')
    return [btn, input]
  }

  beforeEach(() => {
    render(<Home />)
    global.fetch = mockFetch
  })

  it('has a text input field with a label', () => {
    const input = getElements()[1]
    expect(input).toBeInTheDocument()
  })

  it('has a button to submit data', () => {
    const btn = getElements()[0]
    expect(btn).toBeInTheDocument()
  })

  it('does not call the api if text input is blank', async () => {
    const user = userEvent.setup()
    const btn = getElements()[0]
    await user.click(btn)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls the API on click with the correct data', async () => {
    const user = userEvent.setup()
    const URL = 'https://swapi.dev/api/people/1'
    const [btn, input] = getElements()
    await user.type(input, 'people/1')
    await user.click(btn)
    expect(mockFetch).toHaveBeenCalledWith(URL)
  })

  it('displays response data correctly', async () => {
    const user = userEvent.setup()
    const [btn, input] = getElements()
    await user.type(input, 'foo')
    await user.click(btn)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('throws when API returns an error', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject())
    const user = userEvent.setup()
    const [btn, input] = getElements()
    await user.type(input, 'foo')
    await user.click(btn)
    expect(screen.getByText('oops something went wrong!')).toBeInTheDocument()
  })

  it('removes error message when another request is made', async () => {
    // create error
    global.fetch = jest.fn().mockImplementation(() => Promise.reject())
    const user = userEvent.setup()
    const [btn, input] = getElements()
    await user.type(input, 'foo')
    await user.click(btn)

    // make new request
    global.fetch = mockFetch
    await user.click(btn)

    // check that the error message is not displayed
    expect(
      screen.queryByText('oops something went wrong!')
    ).not.toBeInTheDocument()
  })

  // test that previous response is replaced by new response:
  it('replaces the displayed data when a new request is made', async () => {
    // get and display response
    const user = userEvent.setup()
    const [btn, input] = getElements()
    await user.type(input, 'foo')
    await user.click(btn)
    expect(screen.queryByText('test')).toBeInTheDocument()

    global.fetch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({ name: 'new test' }) })
      )

    await user.click(btn)

    expect(screen.queryByText('test')).not.toBeInTheDocument()
  })
})

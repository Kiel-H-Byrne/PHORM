import { render } from '@testing-library/react'
import Layout from '../Layout'

it('renders homepage unchanged', () => {
    const { container } = render(<Layout title='Test Title'><div>Rendered!</div></Layout>)
    expect(container).toMatchSnapshot()
  })
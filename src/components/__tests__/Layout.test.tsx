import Layout from '@components/Layout'
import { render } from '@testing-library/react'

it('renders homepage unchanged', () => {
    const { container } = render(<Layout title='Test Title'><div>Rendered!</div></Layout>)
    expect(container).toMatchSnapshot()
  })
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { NumericGroupedInput } from './NumericGroupedInput'

function TestHost({
  initialValue = '',
  minValue,
  maxValue,
}: {
  initialValue?: string
  minValue?: number
  maxValue?: number
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <NumericGroupedInput
      value={value}
      onValueChange={setValue}
      aria-label="numeric input"
      minValue={minValue}
      maxValue={maxValue}
    />
  )
}

describe('NumericGroupedInput', () => {
  it('accepts only digits and adds group separators', async () => {
    const user = userEvent.setup()
    render(<TestHost />)
    const input = screen.getByLabelText('numeric input')

    await user.type(input, '12a34')

    expect(input).toHaveValue('1 234')
  })

  it('sanitizes pasted values', async () => {
    const user = userEvent.setup()
    render(<TestHost />)
    const input = screen.getByLabelText('numeric input')

    await user.click(input)
    await user.paste('ab1000000cd')

    expect(input).toHaveValue('1 000 000')
  })

  it('handles deletion through formatted values', async () => {
    const user = userEvent.setup()
    render(<TestHost initialValue="1234" />)
    const input = screen.getByLabelText('numeric input')

    await user.click(input)
    await user.type(input, '{backspace}')

    expect(input).toHaveValue('123')
  })

  it('keeps caret in the expected position after insertion in the middle', () => {
    render(<TestHost initialValue="1234" />)
    const input = screen.getByLabelText('numeric input') as HTMLInputElement

    fireEvent.change(input, {
      target: {
        value: '19 234',
        selectionStart: 2,
        selectionEnd: 2,
      },
    })

    expect(input).toHaveValue('19 234')
    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(2)
  })

  it('formats very large values', async () => {
    const user = userEvent.setup()
    render(<TestHost />)
    const input = screen.getByLabelText('numeric input')

    await user.click(input)
    await user.paste('1000000000000')

    expect(input).toHaveValue('1 000 000 000 000')
  })

  it('preserves IME composition flow and sanitizes on composition end', () => {
    render(<TestHost />)
    const input = screen.getByLabelText('numeric input') as HTMLInputElement

    fireEvent.compositionStart(input)
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input).toHaveValue('')

    input.value = '123'
    fireEvent.compositionEnd(input)

    expect(input).toHaveValue('123')
  })

  it('shows validation message and marks input invalid when below min', async () => {
    const user = userEvent.setup()
    render(<TestHost minValue={100} />)
    const input = screen.getByLabelText('numeric input')

    await user.type(input, '99')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Value should be at least 100.')).toBeInTheDocument()
  })

  it('shows validation message and marks input invalid when above max', async () => {
    const user = userEvent.setup()
    render(<TestHost maxValue={999} />)
    const input = screen.getByLabelText('numeric input')

    await user.type(input, '1000')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Value should be at most 999.')).toBeInTheDocument()
  })
})

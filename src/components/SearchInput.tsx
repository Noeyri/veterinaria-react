import { forwardRef, type ChangeEvent } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// forwardRef permite que la página controle el DOM del input con useRef
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = 'Buscar...' }, ref) => (
    <input
      ref={ref}
      type="search"
      className="form-control"
      placeholder={placeholder}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  ),
)

SearchInput.displayName = 'SearchInput'
export default SearchInput

import { useFiltro, type FiltroEspecie as Valor } from '../context/FiltroContext'
import FiltroChips from './FiltroChips'

const opciones: readonly Valor[] = ['Todas', 'Perro', 'Gato', 'Ave', 'Otro']

export default function FiltroEspecie() {
  const { filtroEspecie, setFiltroEspecie } = useFiltro()
  return <FiltroChips opciones={opciones} valor={filtroEspecie} onChange={setFiltroEspecie} etiqueta="Filtrar por especie" />
}
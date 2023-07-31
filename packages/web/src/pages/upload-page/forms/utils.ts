import { useField } from 'formik'

const getFieldName = (base: string, index: number, path: string) =>
  `${base}.${index}.${path}`

const useIndexedField = (base: string, index: number, path: string) => {
  return useField(getFieldName(base, index, path))
}

export const getTrackFieldName = (index: number, path: string) => {
  return getFieldName('trackMetadatas', index, path)
}

export const useTrackField = (path: string) => {
  const [{ value: index }] = useField('trackMetadatasIndex')
  return useIndexedField('trackMetadatas', index, path)
}

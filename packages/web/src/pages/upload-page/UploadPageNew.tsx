import { useEffect, useState } from 'react'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'

import styles from './UploadPage.module.css'
import SelectPageNew from './components/SelectPageNew'
import { EditPage } from './pages/EditPage'
import { UploadFormState } from './types'

enum Phase {
  SELECT,
  EDIT,
  FINISH
}

export const UploadPageNew = () => {
  const [phase, setPhase] = useState(Phase.SELECT)
  const [formState, setFormState] = useState<UploadFormState>({
    uploadType: undefined,
    metadata: undefined,
    tracks: undefined
  })

  // Pretty print json just for testing
  useEffect(() => {
    if (phase !== Phase.FINISH) return
    const stylizePreElements = function () {
      const preElements = document.getElementsByTagName('pre')
      for (let i = 0; i < preElements.length; ++i) {
        const preElement = preElements[i]
        preElement.className += 'prettyprint'
      }
    }

    const injectPrettifyScript = function () {
      const scriptElement = document.createElement('script')
      scriptElement.setAttribute(
        'src',
        'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js'
      )
      document.head.appendChild(scriptElement)
    }

    stylizePreElements()
    injectPrettifyScript()
  }, [phase])

  let page
  switch (phase) {
    case Phase.SELECT:
      page = (
        <SelectPageNew
          formState={formState}
          onContinue={(formState: UploadFormState) => {
            setFormState(formState)
            setPhase(Phase.EDIT)
          }}
        />
      )
      break
    case Phase.EDIT:
      page = (
        <EditPage
          formState={formState}
          onContinue={(formState: UploadFormState) => {
            setFormState(formState)
            setPhase(Phase.FINISH)
          }}
        />
      )
      break
    case Phase.FINISH:
      console.log(formState.tracks?.[0])
      page = formState.tracks ? (
        <pre>{JSON.stringify(formState.tracks, null, 2)}</pre>
      ) : null
  }
  return (
    <Page
      title='Upload'
      description='Upload and publish audio content to the Audius platform'
      contentClassName={styles.upload}
      header={<Header primary={'Upload'} />}
    >
      {page}
    </Page>
  )
}

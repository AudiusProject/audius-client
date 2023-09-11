import dayjs from 'dayjs'

import aiAttribution from '../fixtures/aiAttribution.json'
import remix from '../fixtures/remix.json'
import user from '../fixtures/user.json'
const base64Entropy = Buffer.from(user.entropy).toString('base64')
const timestamp = dayjs().format('YYMMDD_HHmmss')

describe('Upload', () => {
  beforeEach(() => {
    localStorage.setItem('HAS_REQUESTED_BROWSER_PUSH_PERMISSION', 'true')
    localStorage.setItem(
      'FeatureFlagOverride:upload_redesign_enabled',
      'enabled'
    )
  })

  it('user should be able to upload a single track', () => {
    cy.visit(`trending?login=${base64Entropy}`)
    cy.findByRole('link', { name: user.name }).should('exist')
    cy.findByRole('link', { name: /upload track/i }).click()

    // Select track
    cy.findByRole('heading', { name: /upload your music/i, level: 1 }).should(
      'exist'
    )
    cy.findByTestId('upload-dropzone').attachFile('track.mp3', {
      subjectType: 'drag-n-drop'
    })
    cy.findByRole('button', { name: /continue uploading/i }).click()

    // Complete track form

    // // Add track artwork
    cy.findByRole('button', { name: /change artwork/i }).click()

    cy.findByTestId('upload-dropzone').attachFile('track-artwork.jpeg', {
      subjectType: 'drag-n-drop'
    })

    cy.findByRole('textbox', { name: /track name/i })
      .clear()
      .type(`Test track ${timestamp}`)

    cy.findByRole('combobox', { name: /pick a genre/i }).click()
    cy.findByRole('option', { name: /alternative/i }).click()

    cy.findByRole('combobox', { name: /pick a mood/i }).click()
    cy.findByRole('option', { name: /easygoing/i }).click()

    cy.findByRole('textbox', { name: /tags/i })
      .type('tag1{enter}')
      .type('tag2')
      .tab()
      .type('tag3,')

    cy.findByRole('textbox', { name: /description/i }).type('Test Description')

    cy.findByRole('button', { name: /release date/i }).click()
    cy.findByRole('dialog', { name: /release date/i }).within(() => {
      cy.findByRole('button', { name: /release date/i }).click()
    })

    cy.findByRole('application', { name: /calendar/i }).within(() => {
      const dayOfWeekName = dayjs().subtract(1, 'day').format('dddd')
      cy.findAllByRole('button', { name: new RegExp(dayOfWeekName) })
        .first()
        .click()
    })

    cy.findByRole('dialog', { name: /release date/i }).within(() => {
      cy.findByRole('button', { name: /save/i }).click()
    })

    cy.findByRole('button', { name: /remix settings/i }).click()
    cy.findByRole('dialog', { name: /remix settings/i }).within(() => {
      cy.findByRole('checkbox', { name: /hide remixes of this track/i }).should(
        'exist'
      )
      cy.findByRole('checkbox', { name: /hide remixes/i }).should('exist')
      cy.findByRole('checkbox', { name: /identify as remix/i }).check()
      cy.findByRole('textbox').type(`staging.audius.co/${remix.route}`)
      cy.contains(`${remix.name} By df`)
      cy.findByRole('button', { name: /save/i }).click()
    })

    cy.findByRole('button', { name: /stems & source files/i }).click()
    cy.findByRole('dialog', { name: /stems & source files/i }).within(() => {
      cy.findByRole('checkbox', {
        name: /make full mp3 track available/i
      }).check()
      cy.findByTestId('upload-dropzone').attachFile('track.mp3', {
        subjectType: 'drag-n-drop'
      })
      cy.findByRole('listitem').within(() => {
        cy.findByText(/instrumental/i).should('exist')
        cy.findByText('track').should('exist')
      })
      cy.findByRole('button', { name: /save/i }).click()
    })

    cy.findByRole('button', { name: /access & sale/i }).click()
    cy.findByRole('dialog', { name: /access & sale/i }).within(() => {
      cy.findAllByRole('alert')
        .first()
        .within(() => {
          cy.findByText(/this track is marked as a remix/i).should('exist')
        })
      cy.findByRole('radiogroup', { name: /access & sale/i }).within(() => {
        cy.findByRole('radio', { name: /hidden/i }).click()
        cy.findByRole('group', { name: /visible track details/i }).within(
          () => {
            cy.findByRole('checkbox', { name: /share button/i }).click()
          }
        )
      })

      cy.findByRole('button', { name: /save/i }).click()
    })

    cy.findByRole('button', { name: /attribution/i }).click()
    cy.findByRole('dialog', { name: /attribution/i }).within(() => {
      cy.findByRole('checkbox', {
        name: /mark this track as ai generated/i
      }).click()
      cy.findByRole('combobox', { name: /find users/i }).type(
        aiAttribution.name
      )
    })
    cy.findByRole('option', { name: aiAttribution.name }).click()
    cy.findByRole('dialog', { name: /attribution/i }).within(() => {
      cy.findByRole('textbox', { name: /isrc/i }).type('US-123-45-67890')
      cy.findByRole('textbox', { name: /iswc/i }).type('T-123456789-0')
      // TODO test error message
      cy.findByRole('radiogroup', { name: /allow attribution/i }).within(() => {
        cy.findByRole('radio', { name: /allow attribution/i }).click()
      })

      cy.findByRole('radiogroup', { name: /commercial use/i }).within(() => {
        cy.findByRole('radio', { name: /^commercial use/i }).click()
      })

      cy.findByRole('radiogroup', { name: /derivative works/i }).within(() => {
        cy.findByRole('radio', { name: /share-alike/i }).click()
      })

      cy.findByRole('heading', {
        name: 'Attribution ShareAlike CC BY-SA'
      }).should('exist')

      cy.findByRole('button', { name: /save/i }).click()
    })

    cy.findByRole('button', { name: /continue/i }).click()

    cy.findByRole('dialog', { name: /confirm upload/i }).within(() => {
      cy.findByRole('button', { name: /upload/i }).click()
    })
  })
})

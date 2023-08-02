import track from '../fixtures/track.json'
import user from '../fixtures/user.json'

import { waitForTransaction } from './uilts'

describe('Repost Track', () => {
  beforeEach(() => {
    localStorage.setItem('HAS_REQUESTED_BROWSER_PUSH_PERMISSION', 'true')
  })

  it('should repost and unrepost track correctly', () => {
    const base64Entropy = Buffer.from(user.entropy).toString('base64')
    cy.visit(`${track.route}?login=${base64Entropy}`)

    cy.findByText(user.name, { timeout: 20000 }).should('exist')
    cy.findByRole('heading', { name: track.name, timeout: 20000 }).should(
      'exist'
    )

    cy.findByRole('group', { name: /track actions/i }).within(() => {
      cy.findByRole('button', { name: /repost$/i }).click()
      cy.findByRole('button', { name: /reposted/i }).should('exist')
    })
    waitForTransaction(1)
    cy.reload()

    cy.findByRole('group', { name: /track actions/i }).within(() => {
      cy.findByRole('button', { name: /reposted/i }).click()
      cy.findByRole('button', { name: /repost$/i }).should('exist')
    })

    waitForTransaction(2)
    cy.reload()

    cy.findByRole('group', { name: /track actions/i }).within(() => {
      cy.findByRole('button', { name: /repost$/i }).should('exist')
    })
  })
})

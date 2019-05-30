import React from 'react'

import {
  ButtonEventFunction,
  Election,
  FullElectionTally,
  InputEvent,
  SetScreenFunction,
} from '../config/types'

import Button from '../components/Button'
import Prose from '../components/Prose'
import ResultsProcessor from '../components/ResultsProcessor'

import { parseCVRs, fullTallyVotes } from '../lib/votecounting'

interface Props {
  election: Election
  programCard: ButtonEventFunction
  setFullElectionTally: (arg0: FullElectionTally) => void
  setCurrentScreen: SetScreenFunction
}

const DashboardScreen = ({
  election,
  programCard,
  setCurrentScreen,
  setFullElectionTally,
}: Props) => {
  const gotoTestDeck = () => {
    setCurrentScreen('testdeck')
  }

  const handleCVRsFile = (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const CVRsText = reader.result as string
        const votesByPrecinct = parseCVRs({ election, CVRsText })
        const fullElectionTally = fullTallyVotes({ election, votesByPrecinct })
        setFullElectionTally(fullElectionTally)
        setCurrentScreen('tally')
      }
      reader.readAsText(file)
    }
  }

  return (
    <React.Fragment>
      <Prose>
        <h1>{election.title}</h1>
        <p>Select the action you wish to perform.</p>
        <h2>Create Cards</h2>
        <p>
          <Button onClick={programCard} data-id="clerk">
            Election Clerk Card
          </Button>{' '}
          <Button onClick={programCard} data-id="pollworker">
            Poll Worker Card
          </Button>
        </p>
        <h2>Test Decks</h2>
        <p>
          <Button onClick={gotoTestDeck}>Review Test Deck Results</Button>
        </p>

        <h2>Tallying</h2>
        <input type="file" id="vx_cvrs" onChange={handleCVRsFile} />
        <ResultsProcessor election={election} />
      </Prose>
    </React.Fragment>
  )
}

export default DashboardScreen

import React from 'react'

import {
  ButtonEventFunction,
  Election,
  SetScreenFunction,
} from '../config/types'

import Button from '../components/Button'
import Prose from '../components/Prose'
import ResultsProcessor from '../components/ResultsProcessor'

interface Props {
  election: Election
  programCard: ButtonEventFunction
  setCurrentScreen: SetScreenFunction
}

const DashboardScreen = ({
  election,
  programCard,
  setCurrentScreen,
}: Props) => {
  const gotoTestDeck = () => {
    setCurrentScreen('testdeck')
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
        <ResultsProcessor election={election} />
      </Prose>
    </React.Fragment>
  )
}

export default DashboardScreen

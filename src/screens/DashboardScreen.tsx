import React from 'react'

import { ButtonEventFunction, Election } from '../config/types'

import Button from '../components/Button'
import Prose from '../components/Prose'
import ResultsProcessor from '../components/ResultsProcessor'

interface Props {
  election: Election
  programCard: ButtonEventFunction
}

const PrecinctsScreen = ({ election, programCard }: Props) => {
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
        <ResultsProcessor election={election} />
      </Prose>
    </React.Fragment>
  )
}

export default PrecinctsScreen

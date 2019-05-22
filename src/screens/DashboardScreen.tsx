import React from 'react'

import { ButtonEventFunction, OptionalElection } from '../config/types'

import Button from '../components/Button'
import Heading from '../components/Heading'
import Prose from '../components/Prose'

interface Props {
  election: OptionalElection
  programCard: ButtonEventFunction
}

const PrecinctsScreen = ({ election, programCard }: Props) => {
  return (
    <React.Fragment>
      <Heading>
        <Prose>
          {election && <p>{election.title}</p>}

          <h1>Dashboard</h1>
        </Prose>
      </Heading>
      <div>
        <Button onClick={programCard} data-id="admin">
          Program Card
        </Button>
      </div>
    </React.Fragment>
  )
}

export default PrecinctsScreen

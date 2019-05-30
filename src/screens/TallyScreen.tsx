import React from 'react'

import { FullElectionTally, ScreenProps } from '../config/types'

import Button from '../components/Button'
import Prose from '../components/Prose'
import Tally from '../components/Tally'

export interface TallyScreenProps extends ScreenProps {
  fullElectionTally: FullElectionTally
}

const TallyScreen = (props: TallyScreenProps) => {
  const { election, setCurrentScreen, fullElectionTally } = props

  const precinctTallies = []
  for (let precinctId in fullElectionTally.precinctTallies) {
    precinctTallies.push(fullElectionTally.precinctTallies[precinctId]!)
  }
  return (
    <Prose>
      <Button
        onClick={() => {
          setCurrentScreen('')
        }}
      >
        back to Dashboard
      </Button>
      <h1>{election.title} -- Overall Tally</h1>
      <Tally
        election={election}
        electionTally={fullElectionTally.overallTally}
      />

      {precinctTallies.map(precinctTally => (
        <React.Fragment key={precinctTally.precinctId}>
          <h1>
            Tally for{' '}
            {
              election.precincts.find(p => p.id === precinctTally.precinctId!)!
                .name
            }
          </h1>
          <Tally election={election} electionTally={precinctTally} />
        </React.Fragment>
      ))}
    </Prose>
  )
}

export default TallyScreen

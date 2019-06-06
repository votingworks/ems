import React from 'react'

import {
  ButtonEventFunction,
  Election,
  FullElectionTally,
  InputEvent,
  SetScreenFunction,
} from '../config/types'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import MainNav from '../components/MainNav'
import Prose from '../components/Prose'
import ResultsProcessor from '../components/ResultsProcessor'
import Screen from '../components/Screen'

import { parseCVRs, fullTallyVotes } from '../lib/votecounting'

interface Props {
  election: Election
  isProgrammingCard: boolean
  programCard: ButtonEventFunction
  setFullElectionTally: (arg0: FullElectionTally) => void
  setCurrentScreen: SetScreenFunction
  unsetElection: () => void
}

const DashboardScreen = ({
  election,
  isProgrammingCard,
  programCard,
  setCurrentScreen,
  setFullElectionTally,
  unsetElection,
}: Props) => {
  const gotoTestDeck = () => {
    setCurrentScreen('testdeck')
  }

  const gotoBallotProofing = () => {
    setCurrentScreen('ballotproofing')
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

  const ejectUSB = () => {
    fetch('/usbstick/eject', {
      method: 'post',
    })
  }

  return (
    <Screen>
      <Main>
        {isProgrammingCard ? (
          <MainChild center>
            <h1>Programming card…</h1>
          </MainChild>
        ) : (
          <MainChild maxWidth={false}>
            <Prose maxWidth={false}>
              <h1>Pre-Election Actions</h1>
              <h3>View Data</h3>
              <p>
                <Button onClick={gotoBallotProofing}>
                  Proof Ballot Styles
                </Button>{' '}
                <Button onClick={gotoTestDeck}>
                  Print Test Ballot Deck Results
                </Button>
              </p>

              <h3>Program Cards</h3>
              <p>
                <Button onClick={programCard} data-id="clerk">
                  Election Clerk Card
                </Button>{' '}
                <Button onClick={programCard} data-id="pollworker">
                  Poll Worker Card
                </Button>{' '}
                <Button onClick={programCard} data-id="override">
                  Override Write Protection
                </Button>
              </p>

              <hr />

              <h1>Election Day Actions</h1>
              <h2>Tabulate and Print Results</h2>
              <p>Load the following VxScan files from a USB drive:</p>
              <input type="file" id="vx_cvrs" onChange={handleCVRsFile} />

              <ResultsProcessor election={election} />
              <p>
                <Button small onClick={ejectUSB}>
                  Eject USB
                </Button>
              </p>

              <hr />

              <h1>Post-Election Actions</h1>
              <Button onClick={unsetElection}>Clear Election</Button>
            </Prose>
          </MainChild>
        )}
      </Main>
      <MainNav title={election.title} />
    </Screen>
  )
}

export default DashboardScreen

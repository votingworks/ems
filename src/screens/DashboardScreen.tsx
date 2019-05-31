import React from 'react'

import {
  ButtonEventFunction,
  Election,
  FullElectionTally,
  InputEvent,
  SetScreenFunction,
} from '../config/types'

import Brand from '../components/Brand'
import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import Main, { MainChild } from '../components/Main'
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
    <Screen>
      <Main>
        {isProgrammingCard ? (
          <MainChild center>
            <h1>Programming card…</h1>
          </MainChild>
        ) : (
          <MainChild maxWidth={false}>
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
              <p>
                <Button onClick={programCard} data-id="override">
                  Override Write Protection
                </Button>
              </p>

              <h2>Test Ballot Decks</h2>
              <p>
                <Button onClick={gotoTestDeck}>
                  View Test Ballot Deck Results
                </Button>
              </p>

              <ResultsProcessor election={election} />

              <h2>Tallying</h2>
              <input type="file" id="vx_cvrs" onChange={handleCVRsFile} />

              <h2>Factory Reset</h2>
              <Button onClick={unsetElection}>Factory Reset</Button>
            </Prose>
          </MainChild>
        )}
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxServer</Brand>
        <div />
      </ButtonBar>
    </Screen>
  )
}

export default DashboardScreen

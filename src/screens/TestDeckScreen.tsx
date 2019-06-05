import React, { useState } from 'react'
import styled from 'styled-components'

import {
  ButtonEvent,
  CandidateContest,
  Election,
  ElectionTally,
  ScreenProps,
  VotesDict,
} from '../config/types'

import Brand from '../components/Brand'
import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import ButtonList from '../components/ButtonList'
import Prose from '../components/Prose'
import Tally from '../components/Tally'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'

import { filterTalliesByParty, tallyVotes } from '../lib/votecounting'

const ElectionTallyReport = styled.div`
  page-break-before: always;
`

interface GenerateTestDeckParams {
  election: Election
  precinctId?: string
}

const generateTestDeckBallots = ({
  election,
  precinctId,
}: GenerateTestDeckParams) => {
  const precincts: string[] = precinctId
    ? [precinctId]
    : election.precincts.map(p => p.id)

  let votes: VotesDict[] = []

  precincts.forEach(precinctId => {
    const precinct = election.precincts.find(p => p.id === precinctId)!
    const precinctBallotStyles = election.ballotStyles.filter(bs =>
      bs.precincts.includes(precinct.id)
    )

    precinctBallotStyles.forEach(ballotStyle => {
      const contests = election.contests.filter(
        c =>
          ballotStyle.districts.includes(c.districtId) &&
          ballotStyle.partyId === c.partyId
      )

      const numBallots = Math.max(
        ...contests.map(c =>
          c.type === 'yesno' ? 2 : (c as CandidateContest).candidates.length
        )
      )

      for (let ballotNum = 0; ballotNum < numBallots; ballotNum++) {
        let oneBallot: VotesDict = {}
        contests.forEach(contest => {
          if (contest.type === 'yesno') {
            oneBallot[contest.id] = ballotNum % 2 === 0 ? 'yes' : 'no'
          } else {
            oneBallot[contest.id] = [
              contest.candidates[ballotNum % contest.candidates.length],
            ]
          }
        })
        votes.push(oneBallot)
      }
    })
  })

  return votes
}

interface Precinct {
  name: string
  id: string
}

const initialPrecinct: Precinct = { id: '', name: '' }

const TestDeckScreen = ({ election, setCurrentScreen }: ScreenProps) => {
  const [electionTally, setElectionTally] = useState<ElectionTally | undefined>(
    undefined
  )

  const [precinct, setPrecinct] = useState<Precinct>(initialPrecinct)

  const selectPrecinct = (event: ButtonEvent) => {
    const { id = '', name = '' } = (event.target as HTMLElement).dataset
    setPrecinct({ id, name })
    const precinctId = id || undefined
    const votes = generateTestDeckBallots({ election, precinctId })
    const tally = tallyVotes({ election, precinctId, votes })
    setElectionTally(tally)
  }

  const resetDeck = () => {
    setPrecinct(initialPrecinct)
    setElectionTally(undefined)
  }

  const ballotStylePartyIds = Array.from(
    new Set(election.ballotStyles.map(bs => bs.partyId))
  )

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          {electionTally ? (
            <React.Fragment>
              <Prose className="no-print">
                <h1>Test Deck Results</h1>
                <p>
                  <strong>Election:</strong> {election.title}
                  <br />
                  <strong>Precinct:</strong> {precinct.name}
                </p>
                <p>
                  <Button primary onClick={window.print}>
                    Print Results Report
                  </Button>
                </p>
                <p>
                  <Button small onClick={resetDeck}>
                    Back to All Decks
                  </Button>
                </p>
              </Prose>
              <div className="print-only">
                {ballotStylePartyIds.map(partyId => {
                  const party = election.parties.find(p => p.id === partyId)
                  const electionTallyForParty = filterTalliesByParty({
                    election,
                    electionTally,
                    party,
                  })
                  const electionTitle = `${party ? party.name : ''} ${
                    election.title
                  }`
                  return (
                    <ElectionTallyReport key={partyId}>
                      <h1>Test Deck Results</h1>
                      <p>
                        <strong>Election:</strong> {electionTitle}
                        <br />
                        <strong>Precinct:</strong> {precinct.name}
                      </p>
                      <Tally
                        election={election}
                        electionTally={electionTallyForParty}
                      />
                    </ElectionTallyReport>
                  )
                })}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Prose>
                <h1>Test Ballot Deck Results</h1>
                <p>
                  Select desired precinct for <strong>{election.title}</strong>.
                </p>
              </Prose>
              <p>
                <Button
                  data-id=""
                  data-name="All Precincts"
                  fullWidth
                  onClick={selectPrecinct}
                >
                  <strong>All Precincts</strong>
                </Button>
              </p>
              <ButtonList>
                {election.precincts.map(p => (
                  <Button
                    key={p.id}
                    data-id={p.id}
                    data-name={p.name}
                    fullWidth
                    onClick={selectPrecinct}
                  >
                    {p.name}
                  </Button>
                ))}
              </ButtonList>
            </React.Fragment>
          )}
        </MainChild>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxServer</Brand>
        {electionTally && (
          <Button small onClick={resetDeck}>
            All Decks
          </Button>
        )}
        <Button
          small
          onClick={() => {
            setCurrentScreen('')
          }}
        >
          Dashboard
        </Button>
      </ButtonBar>
    </Screen>
  )
}

export default TestDeckScreen

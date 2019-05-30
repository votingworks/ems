import React, { useState } from 'react'

import {
  ButtonEvent,
  CandidateContest,
  Election,
  ElectionTally,
  ScreenProps,
  VotesDict,
} from '../config/types'

import Button from '../components/Button'
import ButtonList from '../components/ButtonList'
import Prose from '../components/Prose'
import Tally from '../components/Tally'

import { tallyVotes } from '../lib/votecounting'

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

const TestDeckScreen = (props: ScreenProps) => {
  const [electionTally, setElectionTally] = useState<ElectionTally | undefined>(
    undefined
  )

  const { election, setCurrentScreen } = props

  const selectPrecinct = (event: ButtonEvent) => {
    const precinctId = (event.target as HTMLElement).dataset.id || undefined
    const votes = generateTestDeckBallots({ election, precinctId })
    const tally = tallyVotes({ election, precinctId, votes })

    setElectionTally(tally)
  }

  if (electionTally) {
    const tallyPrecinctLabel = electionTally.precinctId
      ? election.precincts.find(p => p.id === electionTally.precinctId)!.name
      : 'All Precincts'
    return (
      <Prose>
        <Button
          onClick={() => {
            setCurrentScreen('')
          }}
        >
          back to Dashboard
        </Button>
        <h1>
          {election.title} -- {tallyPrecinctLabel}
        </h1>
        <h2>Test Deck Expected Results</h2>
        <Tally election={election} electionTally={electionTally} />
      </Prose>
    )
  } else {
    return (
      <Prose>
        <Button
          onClick={() => {
            setCurrentScreen('')
          }}
        >
          back to Dashboard
        </Button>
        <h1>{election.title}</h1>
        <ButtonList>
          <Button
            data-id=""
            fullWidth
            key="all-precincts"
            onClick={selectPrecinct}
          >
            All Precincts
          </Button>
          {election.precincts.map(p => (
            <Button
              data-id={p.id}
              fullWidth
              key={p.id}
              onClick={selectPrecinct}
            >
              {p.name}
            </Button>
          ))}
        </ButtonList>
      </Prose>
    )
  }
}

export default TestDeckScreen

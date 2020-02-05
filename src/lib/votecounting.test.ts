import electionSample from '../data/electionSample.json'
import { Election, CandidateContest, ContestTally } from '../config/types'
import { tallyVotes } from './votecounting'

const election = (electionSample as unknown) as Election

test('multi-seat contest', () => {
  // Find a contest with multiple seats (let N be # of seats).
  const multiSeatContest = election.contests.find(
    contest => contest.type === 'candidate' && contest.seats > 1
  ) as CandidateContest

  // Construct votes such that the first N candidates got a vote.
  const votes = {
    [multiSeatContest.id]: multiSeatContest.candidates.slice(
      0,
      multiSeatContest.seats
    ),
  }

  // Tally this single-voter election and get the tally for the contest.
  const electionTally = tallyVotes({ election, votes: [votes] })
  const contestTally = electionTally.contestTallies.find(
    tally => tally.contest === multiSeatContest
  ) as ContestTally

  // Check that the first N candidates have a vote and nobody else does.
  expect(contestTally.tallies).toEqual(
    contestTally.tallies.map(({ option }, i) => ({
      option,
      tally: i < multiSeatContest.seats ? 1 : 0,
    }))
  )
})

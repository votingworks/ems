import {
  Candidate,
  ContestOption,
  ContestOptionTally,
  Dictionary,
  Election,
  ElectionTally,
  VotesByPrecinct,
  VotesDict,
} from '../config/types'

// the generic write-in candidate to keep count
const writeInCandidate: Candidate = {
  id: 'writein',
  name: 'Write-In',
  isWriteIn: true,
}

interface ParseCVRsParams {
  election: Election
  CVRsText: string
}

export function parseCVRs({ election, CVRsText }: ParseCVRsParams) {
  // CVRs are newline-separated JSON objects
  const votesByPrecinct: VotesByPrecinct = {}

  CVRsText.split('\n')
    .filter(el => el) // remove empty lines
    .map(line => JSON.parse(line))
    .forEach(CVR => {
      const vote: VotesDict = {}
      election.contests.forEach(contest => {
        if (!CVR[contest.id]) {
          return
        }

        if (contest.type === 'yesno') {
          // the CVR is encoded the same way
          vote[contest.id] = CVR[contest.id]
          return
        }

        if (contest.type === 'candidate') {
          vote[contest.id] = CVR[contest.id].map((candidateId: string) =>
            candidateId === 'writein'
              ? writeInCandidate
              : contest.candidates.find(c => c.id === candidateId)
          )
        }
      })

      let votes = votesByPrecinct[CVR._precinctId]
      if (!votes) {
        votesByPrecinct[CVR._precinctId] = votes = []
      }

      votes.push(vote)
    })

  return votesByPrecinct
}

interface TallyParams {
  election: Election
  precinctId?: string
  votes: VotesDict[]
}

export function tallyVotes({ election, precinctId, votes }: TallyParams) {
  const electionTally: ElectionTally = {
    contestTallies: [],
    precinctId,
  }

  election.contests.forEach(contest => {
    let options: ContestOption[]
    if (contest.type === 'yesno') {
      options = ['yes', 'no']
    } else {
      options = contest.candidates
    }

    const tallies: ContestOptionTally[] = options
      .map(option => {
        return { option, tally: 0 }
      })
      .concat(
        contest.type === 'candidate' && contest.allowWriteIns
          ? [{ option: writeInCandidate, tally: 0 }]
          : []
      )

    votes.forEach(vote => {
      const selectedOption = vote[contest.id]
      if (!selectedOption) {
        return
      }

      const optionTally = tallies.find(optionTally => {
        if (contest.type === 'yesno') {
          return optionTally.option === selectedOption
        } else {
          const candidateOption = optionTally.option as Candidate
          const selectedCandidateOption = selectedOption[0] as Candidate
          return candidateOption.id === selectedCandidateOption.id
        }
      })!
      optionTally.tally += 1
    })

    electionTally.contestTallies.push({ contest, tallies })
  })

  return electionTally
}

interface FullTallyParams {
  election: Election
  votesByPrecinct: VotesByPrecinct
}

export function fullTallyVotes({ election, votesByPrecinct }: FullTallyParams) {
  const precinctTallies: Dictionary<ElectionTally> = {}

  let allVotes: VotesDict[] = []

  for (let precinctId in votesByPrecinct) {
    const votes = votesByPrecinct[precinctId]!
    precinctTallies[precinctId] = tallyVotes({ election, precinctId, votes })
    allVotes = allVotes.concat(votes)
  }

  const overallTally = tallyVotes({ election, votes: allVotes })

  return {
    precinctTallies,
    overallTally,
  }
}
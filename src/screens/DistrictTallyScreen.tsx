import React from 'react'

import { ScreenProps, CastVoteRecord, District } from '../config/types'

import Button from '../components/Button'
import Brand from '../components/Brand'
import ButtonBar from '../components/ButtonBar'
import Prose from '../components/Prose'
// import Tally from '../components/Tally'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'

// import { filterTalliesByParty } from '../lib/votecounting'
// import find from '../utils/find'
// import HorizontalRule from '../components/HorizontalRule'

// const FullTally = styled.div`
//   page-break-before: always;
// `
// const PrecinctTally = styled.div`
//   page-break-before: always;
// `

export interface TallyScreenProps extends ScreenProps {
  castVoteRecords: CastVoteRecord[]
}

const TallyScreen = (props: TallyScreenProps) => {
  const { castVoteRecords, election, setScreen } = props

  // for each state-wide contest
  const stateWideContests = election.contests.filter(
    c => c.section === 'State Of Mississippi' // Yikes!
  )
  console.log({ stateWideContests })

  // get ballot styles that map to district
  const stateWideContestDistricts = stateWideContests.reduce(
    (districts: District[], contest) => {
      const district = election.districts.find(d => d.id === contest.districtId)
      const districtAdded = districts.find(d => d.id === contest.districtId)
      if (district && !districtAdded) {
        districts.push(district)
      }
      // if (!districts.includes(contest.districtId)) {
      //   districts.push(contest.districtId)
      // }
      return districts
    },
    []
  )
  // console.log({ stateWideContestDistricts })

  const ballotStylesForStateWideContestDistricts = election.ballotStyles.filter(
    bs =>
      bs.districts.filter(id =>
        stateWideContestDistricts.find(d => d.id === id)
      )
  )
  console.log({ ballotStylesForStateWideContestDistricts })

  // get ballots matching those styles
  const castVoteRecordsForStateWideContests = castVoteRecords.filter(cvr =>
    ballotStylesForStateWideContestDistricts.some(
      bs => bs.id === cvr._ballotStyleId
    )
  )
  // console.log({ castVoteRecordsForStateWideContests })

  // tally contests by precinct.

  const tally = stateWideContestDistricts.map(d => ({
    district: d,
    contests: election.contests
      .filter(c => c.districtId === d.id)
      .map(c => ({
        contest: c,
        precincts: election.precincts.map(p => ({
          precinct: p,
          tallies: [],
        })),
      })),
  }))

  const _tallyByDistrict = [
    {
      district: {},
      contests: [
        {
          contest: {},
          precincts: [
            {
              precinct: {},
              tallies: [
                {
                  option: {}, // candidate || yes/no
                  tally: 8,
                },
              ],
            },
          ],
        },
      ],
    },
  ]
  console.log({ _tallyByDistrict, tally })

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <Prose className="no-print">
            <h1>Tally By District</h1>
            <p>
              <strong>Election:</strong> {election.title}
            </p>
            <p>
              <Button primary onClick={window.print}>
                Print Tally By District
              </Button>
            </p>
            <p>
              <Button small onClick={setScreen}>
                Back to Dashboard
              </Button>
            </p>
          </Prose>
          <div className="print-onlyz">
            {stateWideContests.map(contest => (
              <li key={contest.title}>{contest.title}</li>
            ))}
          </div>
        </MainChild>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxServer</Brand>
        <Button small onClick={setScreen}>
          Dashboard
        </Button>
      </ButtonBar>
    </Screen>
  )
}

export default TallyScreen

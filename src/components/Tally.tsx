import React from 'react'
import styled from 'styled-components'

import { Candidate, Election, ElectionTally } from '../config/types'

import Prose from './Prose'
import Table, { TD } from './Table'

const Contest = styled.div`
  margin: 2rem 0 4rem;
  page-break-inside: avoid;
`

interface Props {
  election: Election
  electionTally: ElectionTally
}

const Tally = ({ electionTally }: Props) => (
  <React.Fragment>
    {electionTally.contestTallies.map(({ contest, tallies }) => (
      <Contest key={`div-${contest.id}`}>
        <Prose>
          <h2>
            {contest.section}, {contest.title}
          </h2>
          <Table>
            <tbody>
              {tallies.map(tally => {
                const key = `${contest.id}-${
                  contest.type === 'candidate'
                    ? (tally.option as Candidate).id
                    : tally.option
                }`
                const choice =
                  contest.type === 'candidate'
                    ? (tally.option as Candidate).name
                    : tally.option
                return (
                  <tr key={key}>
                    <td>{choice}</td>
                    <TD narrow textAlign="right">
                      {tally.tally}
                    </TD>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Prose>
      </Contest>
    ))}
  </React.Fragment>
)
export default Tally

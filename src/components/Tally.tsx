import React from 'react'

import { Candidate, Election, ElectionTally } from '../config/types'

interface Props {
  election: Election
  electionTally: ElectionTally
}

const Tally = ({ electionTally }: Props) => {
  return (
    <React.Fragment>
      {electionTally.contestTallies.map(contestTally => {
        const { contest } = contestTally
        return (
          <React.Fragment key={`div-${contest.id}`}>
            <h2>
              {contest.section} -- {contest.title}
            </h2>
            <table>
              <tbody>
                {contestTally.tallies.map(tally => (
                  <tr
                    key={`${contest.id}-${
                      contest.type === 'candidate'
                        ? (tally.option as Candidate).id
                        : tally.option
                    }`}
                  >
                    <td>
                      {contest.type === 'candidate'
                        ? (tally.option as Candidate).name
                        : tally.option}
                    </td>
                    <td>{tally.tally}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </React.Fragment>
        )
      })}
    </React.Fragment>
  )
}
export default Tally

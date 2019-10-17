import React from 'react'
import styled from 'styled-components'

import { ElectionTally, FullElectionTally, ScreenProps } from '../config/types'

import Button from '../components/Button'
import Brand from '../components/Brand'
import ButtonBar from '../components/ButtonBar'
import Prose from '../components/Prose'
import Tally from '../components/Tally'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'

import { filterTalliesByParty } from '../lib/votecounting'

const FullTally = styled.div`
  page-break-before: always;
`
const PrecinctTally = styled.div`
  page-break-before: always;
`

export interface TallyScreenProps extends ScreenProps {
  fullElectionTally: FullElectionTally | undefined
}

const TallyScreen = (props: TallyScreenProps) => {
  const { election, setCurrentScreen, fullElectionTally } = props

  const goToDashboard = () => {
    setCurrentScreen('')
  }

  if (!fullElectionTally) {
    return (
      <Screen>
        <Main>
          <MainChild>
            <Prose>
              <h1>No Tally</h1>
              <p>File did not contain CVR data.</p>
              <Button onClick={goToDashboard}>Back to Dashboard</Button>
            </Prose>
          </MainChild>
        </Main>
        <ButtonBar secondary naturalOrder separatePrimaryButton>
          <Brand>VxServer</Brand>
          <Button small onClick={goToDashboard}>
            Dashboard
          </Button>
        </ButtonBar>
      </Screen>
    )
  } else {
    const precinctTallies: ElectionTally[] = []
    for (let precinctId in fullElectionTally.precinctTallies) {
      precinctTallies.push(fullElectionTally.precinctTallies[precinctId]!)
    }

    const ballotStylePartyIds = Array.from(
      new Set(election.ballotStyles.map(bs => bs.partyId))
    )

    return (
      <Screen>
        <Main>
          <MainChild maxWidth={false}>
            <Prose className="no-print">
              <h1>Full Election Tally</h1>
              <p>
                <strong>Election:</strong> {election.title}
              </p>
              <p>
                <Button primary onClick={window.print}>
                  Print Full Election Tally
                </Button>
              </p>
              <p>
                <Button small onClick={goToDashboard}>
                  Back to Dashboard
                </Button>
              </p>
            </Prose>
            <div className="print-only">
              {ballotStylePartyIds.map(partyId => {
                const party = election.parties.find(p => p.id === partyId)
                const overallTally = filterTalliesByParty({
                  election,
                  electionTally: fullElectionTally.overallTally,
                  party,
                })

                const precinctTalliesByParty = precinctTallies.map(
                  precinctTally =>
                    filterTalliesByParty({
                      election,
                      electionTally: precinctTally,
                      party,
                    })
                )

                const electionTitle = `${party ? party.name : ''} ${
                  election.title
                }`

                return (
                  <React.Fragment key={partyId}>
                    <FullTally>
                      <Prose>
                        <h1>Full Election Tally</h1>
                        <p>
                          <strong>Election:</strong> {electionTitle}
                          <br />
                          <span>
                            <strong>Precinct:</strong> All Precincts
                          </span>
                        </p>
                      </Prose>
                    </FullTally>
                    <Tally election={election} electionTally={overallTally} />
                    {precinctTalliesByParty.map(precinctTally => (
                      <PrecinctTally key={precinctTally.precinctId}>
                        <Prose>
                          <h1>Precinct Tally</h1>
                          <p>
                            <strong>Election:</strong> {electionTitle}
                            <br />
                            <strong>Precinct:</strong>{' '}
                            {
                              election.precincts.find(
                                p => p.id === precinctTally.precinctId!
                              )!.name
                            }
                          </p>
                        </Prose>
                        <hr />
                        <Tally
                          election={election}
                          electionTally={precinctTally}
                        />
                      </PrecinctTally>
                    ))}
                  </React.Fragment>
                )
              })}
            </div>
          </MainChild>
        </Main>
        <ButtonBar secondary naturalOrder separatePrimaryButton>
          <Brand>VxServer</Brand>
          <Button small onClick={goToDashboard}>
            Dashboard
          </Button>
        </ButtonBar>
      </Screen>
    )
  }
}

export default TallyScreen

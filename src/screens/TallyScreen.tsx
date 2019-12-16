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
import find from '../utils/find'
import HorizontalRule from '../components/HorizontalRule'

const TallyHeader = styled.div`
  page-break-before: always;
`

export interface TallyScreenProps extends ScreenProps {
  fullElectionTally: FullElectionTally
  precinctIdTallyFilter: string
}

const TallyScreen = (props: TallyScreenProps) => {
  const {
    election,
    setCurrentScreen,
    fullElectionTally,
    precinctIdTallyFilter,
  } = props

  const goToDashboard = () => {
    setCurrentScreen('')
  }

  const electionPrecinctTallies = Object.values(
    fullElectionTally.precinctTallies
  ) as ElectionTally[]

  const ballotStylePartyIds = Array.from(
    new Set(election.ballotStyles.map(bs => bs.partyId))
  )

  const precinctName =
    precinctIdTallyFilter &&
    find(election.precincts, p => p.id === precinctIdTallyFilter).name

  const pageTitle = precinctIdTallyFilter
    ? `Precinct Tally: ${precinctName}`
    : `Election Tally and ${electionPrecinctTallies.length} Precinct Tallies`

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <Prose className="no-print">
            <h1>{pageTitle}</h1>
            <p>
              <strong>Election:</strong> {election.title}
              {precinctName && (
                <React.Fragment>
                  <br />
                  <span>
                    <strong>Precinct:</strong> {precinctName}
                  </span>
                </React.Fragment>
              )}
            </p>

            <p>
              <Button primary onClick={window.print}>
                Print Tally Report
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
              let precinctTallies = electionPrecinctTallies
              let overallTally = fullElectionTally.overallTally

              const party = election.parties.find(p => p.id === partyId)
              const electionTitle = party
                ? `${party.name} ${election.title}`
                : election.title

              if (party) {
                overallTally = filterTalliesByParty({
                  election,
                  electionTally: fullElectionTally.overallTally,
                  party,
                })
                precinctTallies = electionPrecinctTallies.map(precinctTally =>
                  filterTalliesByParty({
                    election,
                    electionTally: precinctTally,
                    party,
                  })
                )
              }

              if (precinctIdTallyFilter) {
                precinctTallies = precinctTallies.filter(
                  pt => pt.precinctId === precinctIdTallyFilter
                )
              }

              return (
                <React.Fragment key={partyId || 'none'}>
                  {!precinctIdTallyFilter && (
                    <React.Fragment>
                      <TallyHeader>
                        <Prose>
                          <h1>Election Tally</h1>
                          <p>
                            <strong>Election:</strong> {electionTitle}
                            <br />
                            <span>
                              <strong>Precinct:</strong> All Precincts
                            </span>
                          </p>
                        </Prose>
                      </TallyHeader>
                      <Tally election={election} electionTally={overallTally} />
                    </React.Fragment>
                  )}
                  {precinctTallies.map(precinctTally => {
                    const precinctName = find(
                      election.precincts,
                      p => p.id === precinctTally.precinctId
                    ).name
                    return (
                      <TallyHeader key={precinctTally.precinctId}>
                        <Prose>
                          <h1>Precinct Tally: {precinctName}</h1>
                          <p>
                            <strong>Election:</strong> {electionTitle}
                            <br />
                            <strong>Precinct:</strong> {precinctName}
                          </p>
                        </Prose>
                        <HorizontalRule />
                        <Tally
                          election={election}
                          electionTally={precinctTally}
                        />
                      </TallyHeader>
                    )
                  })}
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

export default TallyScreen

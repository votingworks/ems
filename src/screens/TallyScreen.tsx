import React from 'react'
import styled from 'styled-components'

import { FullElectionTally, ScreenProps } from '../config/types'

import Button from '../components/Button'
import Brand from '../components/Brand'
import ButtonBar from '../components/ButtonBar'
import Prose from '../components/Prose'
import Tally from '../components/Tally'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'

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
          <Button onClick={goToDashboard}>Dashboard</Button>
        </ButtonBar>
      </Screen>
    )
  } else {
    const precinctTallies = []
    for (let precinctId in fullElectionTally.precinctTallies) {
      precinctTallies.push(fullElectionTally.precinctTallies[precinctId]!)
    }

    return (
      <Screen>
        <Main>
          <MainChild maxWidth={false}>
            <Prose>
              <h1>Full Election Tally</h1>
              <p>
                <strong>Election:</strong> {election.title}
                <br />
                <span className="print-only">
                  <strong>Precinct:</strong> All Precincts
                </span>
              </p>
              <p className="no-print">
                <Button primary onClick={window.print}>
                  Print Full Election Tally
                </Button>
              </p>
              <p className="no-print">
                <Button small onClick={goToDashboard}>
                  Back to Dashboard
                </Button>
              </p>
            </Prose>
            <div className="print-only">
              <hr />
              <Tally
                election={election}
                electionTally={fullElectionTally.overallTally}
              />
              {precinctTallies.map(precinctTally => (
                <PrecinctTally key={precinctTally.precinctId}>
                  <Prose>
                    <h1>Precinct Tally</h1>
                    <p>
                      <strong>Election:</strong> {election.title}
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
                  <Tally election={election} electionTally={precinctTally} />
                </PrecinctTally>
              ))}
            </div>
          </MainChild>
        </Main>
        <ButtonBar secondary naturalOrder separatePrimaryButton>
          <Brand>VxServer</Brand>
          <Button onClick={goToDashboard}>Dashboard</Button>
        </ButtonBar>
      </Screen>
    )
  }
}

export default TallyScreen

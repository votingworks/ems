import React, { useState } from 'react'

import { BallotStyle, ButtonEventFunction, ScreenProps } from '../config/types'

import Brand from '../components/Brand'
import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import ButtonList from '../components/ButtonList'
import Prose from '../components/Prose'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'
import HorizontalRule from '../components/HorizontalRule'

const BallotProofingScreen = ({ election, setScreen }: ScreenProps) => {
  const [ballotStyle, setBallotStyle] = useState<BallotStyle | undefined>(
    undefined
  )

  const selectBallotStyle: ButtonEventFunction = event => {
    const { id = '' } = event.currentTarget.dataset
    setBallotStyle(election.ballotStyles.find(bs => bs.id === id))
  }

  const reset = () => {
    setBallotStyle(undefined)
  }

  const sortedBallotIds = election.ballotStyles
    .map(bs => bs.id)
    .sort((id1, id2) => (id1.padStart(6, '0') < id2.padStart(6, '0') ? -1 : 1))

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          {ballotStyle ? (
            <React.Fragment>
              <Prose maxWidth={false}>
                <h1>Ballot Style {ballotStyle.id}</h1>
                <p>
                  Contest titles and choices for ballot style{' '}
                  <strong>{ballotStyle.id}</strong>.
                </p>
                <HorizontalRule />
                {election.contests
                  .filter(
                    contest =>
                      ballotStyle.districts.includes(contest.districtId) &&
                      ballotStyle.partyId === contest.partyId
                  )
                  .map(contest => (
                    <React.Fragment key={contest.id}>
                      <h2>{contest.title}</h2>
                      {contest.type === 'candidate' ? (
                        <ul>
                          {contest.candidates.map(candidate => (
                            <li key={candidate.id}>{candidate.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul>
                          <li>Yes</li>
                          <li>No</li>
                        </ul>
                      )}
                    </React.Fragment>
                  ))}
                <HorizontalRule />
                <p>End of ballot style “{ballotStyle.id}”</p>
              </Prose>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Prose compact marginBottom>
                <p>{election.title}</p>
                <h1>Ballot Styles</h1>
              </Prose>
              <ButtonList>
                {sortedBallotIds.map(id => (
                  <Button
                    key={id}
                    data-id={id}
                    fullWidth
                    onClick={selectBallotStyle}
                  >
                    {id}
                  </Button>
                ))}
              </ButtonList>
            </React.Fragment>
          )}
        </MainChild>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxServer</Brand>
        {ballotStyle && (
          <Button small onClick={reset}>
            All Ballot Styles
          </Button>
        )}
        <Button small onClick={setScreen}>
          Dashboard
        </Button>
      </ButtonBar>
    </Screen>
  )
}

export default BallotProofingScreen

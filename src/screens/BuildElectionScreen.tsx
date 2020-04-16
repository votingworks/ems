import React from 'react'

import { ScreenProps } from '../config/types'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import MainNav from '../components/MainNav'
import Screen from '../components/Screen'

const BuildElectionScreen = ({
  election,
  setElection,
  setCurrentScreen,
}: ScreenProps) => {
  const done = () => {
    setCurrentScreen('')
  }

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newElection = JSON.parse(evt.target.value)
      if (newElection && setElection) {
        setElection(newElection)
      }
    } catch {
      // es-lint-disable-next-line no-empty
    }
  }

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <form>
            <textarea
              value={JSON.stringify(election, undefined, 4)}
              cols={80}
              rows={50}
              onChange={handleChange}
            />
            <br />
            <Button onClick={done}>Save</Button>
          </form>
        </MainChild>
      </Main>
      <MainNav title="Build Election">
        <Button small onClick={done}>
          Dashboard
        </Button>
      </MainNav>
    </Screen>
  )
}

export default BuildElectionScreen

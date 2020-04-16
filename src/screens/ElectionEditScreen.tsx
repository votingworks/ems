import React, { useState } from 'react'

import { ScreenProps } from '../config/types'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import MainNav from '../components/MainNav'
import Screen from '../components/Screen'

const ElectionEditScreen = ({
  election,
  setElection,
  setCurrentScreen,
}: ScreenProps) => {
  const [electionString, setElectionString] = useState(
    JSON.stringify(election, undefined, 4)
  )

  const done = () => {
    try {
      const newElection = JSON.parse(electionString)
      if (newElection && setElection) {
        setElection(newElection)
        setCurrentScreen('')
      }
    } catch {
      // es-lint-disable-next-line no-empty
    }
  }

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setElectionString(evt.target.value)
  }

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <form>
            <textarea
              value={electionString}
              cols={80}
              rows={50}
              onChange={handleChange}
            />
            <br />
            <Button onClick={done}>Done</Button>
          </form>
        </MainChild>
      </Main>
      <MainNav title="Edit Election">
        <Button small onClick={done}>
          Dashboard
        </Button>
      </MainNav>
    </Screen>
  )
}

export default ElectionEditScreen

import React, { useEffect } from 'react'

import { ScreenProps } from '../config/types'

import Brand from '../components/Brand'
import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import Main, { MainChild } from '../components/Main'
import Screen from '../components/Screen'

const ManualScanScreen = ({ election, setCurrentScreen }: ScreenProps) => {
  const addBallot = async (event: React.FormEvent) => {
    event.preventDefault()
    const input = document.getElementById('ballotString')! as HTMLInputElement
    const ballotString = input.value
    input.value = ''
    window.alert(election.title + ' - ' + ballotString)
  }

  useEffect(() => {
    document.getElementById('ballotString')!.focus()
  })

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <h2>Scan Ballots Manually</h2>
          <form onSubmit={addBallot} className="visually-hidden">
            <input
              type="text"
              id="ballotString"
              name="ballotString"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
        </MainChild>
      </Main>
      <ButtonBar secondary naturalOrder separatePrimaryButton>
        <Brand>VxServer</Brand>
        <Button
          small
          onClick={() => {
            setCurrentScreen('')
          }}
        >
          Dashboard
        </Button>
      </ButtonBar>
    </Screen>
  )
}

export default ManualScanScreen

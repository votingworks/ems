import React, { useState } from 'react'

import { ButtonEvent, CardData, OptionalElection } from './config/types'

import Brand from './components/Brand'
import Button from './components/Button'
import ButtonBar from './components/ButtonBar'
import Main, { MainChild } from './components/Main'
import Screen from './components/Screen'
import useStateAndLocalStorage from './hooks/useStateWithLocalStorage'

import LoadElectionScreen from './screens/LoadElectionScreen'
import DashboardScreen from './screens/DashboardScreen'

import 'normalize.css'
import './App.css'

let checkCardInterval = 0

let loadingElection = false

const App: React.FC = () => {
  const [isProgrammingCard, setIsProgrammingCard] = useState(false)
  const [election, setElection] = useStateAndLocalStorage<OptionalElection>(
    'election'
  )
  const unsetElection = () => setElection(undefined)

  const programCard = async (event: ButtonEvent) => {
    const id = (event.target as HTMLElement).dataset.id
    setIsProgrammingCard(true)

    const electionJSON = JSON.stringify(election)
    const hash = 'bogusfornow'
    const shortValue = JSON.stringify({
      t: id,
      h: hash,
    })

    let formData = new FormData()

    switch (id) {
      case 'pollworker':
        await fetch('/card/write', {
          method: 'post',
          body: shortValue,
        })
        break
      case 'clerk':
        formData.append('short_value', shortValue)
        formData.append('long_value', electionJSON)
        await fetch('/card/write_short_and_long', {
          method: 'post',
          body: formData,
        })
        break
      default:
        break
    }

    setIsProgrammingCard(false)
  }

  const fetchElection = async () => {
    return fetch('/card/read_long', { cache: 'no-store' })
      .then(result => result.json())
      .then(resultJSON => JSON.parse(resultJSON.longValue))
  }

  const processCardData = (cardData: CardData, longValueExists: boolean) => {
    if (cardData.t === 'clerk') {
      if (!election) {
        if (longValueExists && !loadingElection) {
          loadingElection = true
          fetchElection().then(election => {
            setElection(election)
            loadingElection = false

            // no need to keep checking
            window.clearInterval(checkCardInterval)
          })
        }
      }
    }
  }

  if (!checkCardInterval) {
    checkCardInterval = window.setInterval(() => {
      fetch('/card/read', { cache: 'no-store' })
        .then(result => result.json())
        .then(resultJSON => {
          if (resultJSON.shortValue) {
            const cardData = JSON.parse(resultJSON.shortValue) as CardData
            processCardData(cardData, resultJSON.longValueExists)
          }
        })
        .catch(() => {
          window.clearInterval(checkCardInterval)
        })
    }, 1000)
  }

  if (election) {
    return (
      <Screen>
        <Main>
          {isProgrammingCard ? (
            <MainChild center>
              <h1>Programming card…</h1>
            </MainChild>
          ) : (
            <MainChild maxWidth={false}>
              <DashboardScreen election={election} programCard={programCard} />
            </MainChild>
          )}
        </Main>
        <ButtonBar secondary naturalOrder separatePrimaryButton>
          <Brand>VxServer</Brand>
          <Button onClick={unsetElection}>Factory Reset</Button>
        </ButtonBar>
      </Screen>
    )
  }

  return <LoadElectionScreen setElection={setElection} />
}

export default App

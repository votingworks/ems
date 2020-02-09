import fileDownload from 'js-file-download'
import React, { useState } from 'react'

import {
  CardData,
  FullElectionTally,
  OptionalElection,
  VotesByPrecinct,
  ButtonEventFunction,
} from './config/types'

import useStateAndLocalStorage from './hooks/useStateWithLocalStorage'
import useInterval from './hooks/useInterval'

import LoadElectionScreen from './screens/LoadElectionScreen'
import DashboardScreen from './screens/DashboardScreen'
import BallotProofingScreen from './screens/BallotProofingScreen'
import TestDeckScreen from './screens/TestDeckScreen'
import TallyScreen from './screens/TallyScreen'

import 'normalize.css'
import './App.css'
import WritingCardScreen from './screens/WritingCardScreen'
import ConverterClient from './lib/ConverterClient'
import CastVoteRecordFiles from './utils/CastVoteRecordFiles'

let loadingElection = false

const App: React.FC = () => {
  const [cardReaderWorking, setCardReaderWorking] = useState(true)
  const [castVoteRecordFiles, setCastVoteRecordFiles] = useState(
    CastVoteRecordFiles.empty
  )
  const [currentScreen, setCurrentScreen] = useState('')
  const [precinctIdTallyFilter, setPrecinctIdTallyFilter] = useState('')
  const [election, setElection] = useStateAndLocalStorage<OptionalElection>(
    'election'
  )
  const [fullElectionTally, setFullElectionTally] = useState<
    FullElectionTally | undefined
  >(undefined)
  const [isProgrammingCard, setIsProgrammingCard] = useState(false)
  const [votesByPrecinct, setVotesByPrecinct] = useState<VotesByPrecinct>({})

  const unconfigure = () => {
    setCastVoteRecordFiles(CastVoteRecordFiles.empty)
    setCurrentScreen('')
    setPrecinctIdTallyFilter('')
    setElection(undefined)
    setFullElectionTally(undefined)
    setIsProgrammingCard(false)
    setVotesByPrecinct({})
    window.localStorage.clear()
  }

  const programCard: ButtonEventFunction = async event => {
    const id = event.currentTarget.dataset.id
    setIsProgrammingCard(true)

    if (id === 'override') {
      await fetch('/card/write_protect_override', {
        method: 'post',
      })
      window.setTimeout(() => {
        setIsProgrammingCard(false)
      }, 1000)
      return
    }

    const electionJSON = JSON.stringify(election)
    // TODO: https://github.com/votingworks/ems/issues/8
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
          })
        }
      }
    }
  }

  const exportResults = async () => {
    const CastVoteRecordsString = castVoteRecordFiles.castVoteRecords
      .map(c => JSON.stringify(c))
      .join('\n')

    // process on the server
    const client = new ConverterClient('results')
    const { inputFiles, outputFiles } = await client.getFiles()
    const [electionDefinitionFile, cvrFile] = inputFiles
    const resultsFile = outputFiles[0]

    await client.setInputFile(
      electionDefinitionFile.name,
      new File([JSON.stringify(election)], electionDefinitionFile.name, {
        type: 'application/json',
      })
    )
    await client.setInputFile(
      cvrFile.name,
      new File([CastVoteRecordsString], 'cvrs')
    )
    await client.process()

    // download the result
    const results = await client.getOutputFile(resultsFile.name)
    fileDownload(results, 'sems-results.csv', 'text/csv')

    // reset server files
    await client.reset()
  }

  useInterval(
    () => {
      fetch('/card/read', { cache: 'no-store' })
        .then(result => result.json())
        .then(resultJSON => {
          if (resultJSON.shortValue) {
            const cardData = JSON.parse(resultJSON.shortValue) as CardData
            processCardData(cardData, resultJSON.longValueExists)
          }
        })
        .catch(() => {
          setCardReaderWorking(false)
        })
    },
    cardReaderWorking && !election ? 1000 : undefined
  )

  if (election) {
    if (isProgrammingCard) {
      return <WritingCardScreen />
    }
    if (currentScreen) {
      switch (currentScreen) {
        case 'tally':
          return (
            <TallyScreen
              election={election}
              setCurrentScreen={setCurrentScreen}
              precinctIdTallyFilter={precinctIdTallyFilter}
              fullElectionTally={fullElectionTally as FullElectionTally}
            />
          )
        case 'testdeck':
          return (
            <TestDeckScreen
              election={election}
              setCurrentScreen={setCurrentScreen}
            />
          )
        case 'ballotproofing':
          return (
            <BallotProofingScreen
              election={election}
              setCurrentScreen={setCurrentScreen}
            />
          )
        default:
      }
    }
    return (
      <DashboardScreen
        castVoteRecordFiles={castVoteRecordFiles}
        election={election}
        fullElectionTally={fullElectionTally}
        programCard={programCard}
        setCastVoteRecordFiles={setCastVoteRecordFiles}
        setCurrentScreen={setCurrentScreen}
        setPrecinctIdTallyFilter={setPrecinctIdTallyFilter}
        setFullElectionTally={setFullElectionTally}
        setVotesByPrecinct={setVotesByPrecinct}
        unconfigure={unconfigure}
        votesByPrecinct={votesByPrecinct}
        exportResults={exportResults}
      />
    )
  }

  return <LoadElectionScreen setElection={setElection} />
}

export default App

import React from 'react'

import {
  ButtonEventFunction,
  Election,
  FullElectionTally,
  SetCastVoteRecordFilesFunction,
  SetScreenFunction,
  VotesByPrecinct,
  InputEventFunction,
} from '../config/types'

import { fullTallyVotes, getVotesByPrecinct } from '../lib/votecounting'

import Button from '../components/Button'
import FileInputButton from '../components/FileInputButton'
import Main, { MainChild } from '../components/Main'
import MainNav from '../components/MainNav'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import Table, { TD } from '../components/Table'
import Text from '../components/Text'
import HorizontalRule from '../components/HorizontalRule'
import CastVoteRecordFiles from '../utils/CastVoteRecordFiles'

interface Props {
  castVoteRecordFiles: CastVoteRecordFiles
  election: Election
  fullElectionTally: FullElectionTally | undefined
  programCard: ButtonEventFunction
  setCastVoteRecordFiles: SetCastVoteRecordFilesFunction
  setCurrentScreen: SetScreenFunction
  setFullElectionTally: React.Dispatch<
    React.SetStateAction<FullElectionTally | undefined>
  >
  setPrecinctIdTallyFilter: React.Dispatch<React.SetStateAction<string>>
  setVotesByPrecinct: React.Dispatch<React.SetStateAction<VotesByPrecinct>>
  unconfigure: () => void
  votesByPrecinct: VotesByPrecinct
  exportResults: () => void
}

const DashboardScreen = ({
  castVoteRecordFiles,
  election,
  fullElectionTally,
  programCard,
  setCastVoteRecordFiles,
  setCurrentScreen,
  setFullElectionTally,
  setPrecinctIdTallyFilter,
  setVotesByPrecinct,
  unconfigure,
  votesByPrecinct,
  exportResults,
}: Props) => {
  const gotoTestDeck = () => {
    setCurrentScreen('testdeck')
  }

  const gotoBallotProofing = () => {
    setCurrentScreen('ballotproofing')
  }

  const setPrecinctTally = (precinctId?: string) => {
    setPrecinctIdTallyFilter(precinctId || '')
    setCurrentScreen('tally')
  }
  const showCastVoteRecordsTally = () => {
    setPrecinctTally()
  }

  const processCastVoteRecordFiles: InputEventFunction = async event => {
    const input = event.currentTarget
    const files = Array.from(input.files || [])
    const newCastVoteRecordFiles = await castVoteRecordFiles.addAll(files)

    setCastVoteRecordFiles(newCastVoteRecordFiles)

    const vbp = getVotesByPrecinct({
      election,
      castVoteRecords: newCastVoteRecordFiles.castVoteRecords,
    })
    setVotesByPrecinct(vbp)

    const ft = fullTallyVotes({ election, votesByPrecinct: vbp })
    setFullElectionTally(ft)

    input.value = ''
  }

  const resetCastVoteRecordFiles = () => {
    setCastVoteRecordFiles(CastVoteRecordFiles.empty)
  }

  const ejectUSB = () => {
    fetch('/usbstick/eject', {
      method: 'post',
    })
  }

  const getPrecinctNames = (precinctIds: readonly string[]) =>
    precinctIds
      .map(id => election.precincts.find(p => p.id === id)!.name)
      .join(', ')

  const castVoteRecordFileList = castVoteRecordFiles.fileList
  const hasCastVoteRecordFiles = !!castVoteRecordFileList.length
  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <Prose maxWidth={false}>
            <h1>Pre-Election Actions</h1>
            <h2>View Converted Election Data</h2>
            <p>
              <Button onClick={gotoBallotProofing}>Proof Ballot Styles</Button>{' '}
              <Button onClick={gotoTestDeck}>
                Print Test Ballot Deck Results
              </Button>
            </p>
            <h2>Program Cards</h2>
            <p>
              <Button onClick={programCard} data-id="clerk">
                Election Clerk Card
              </Button>{' '}
              <Button onClick={programCard} data-id="pollworker">
                Poll Worker Card
              </Button>{' '}
              <Button onClick={programCard} data-id="override">
                Override Write Protection
              </Button>
            </p>
            <HorizontalRule />
            <h1>Election Day Actions</h1>
            <h2>Cast Vote Record (CVR) files</h2>
            <Table>
              <tbody>
                {hasCastVoteRecordFiles ? (
                  <React.Fragment>
                    <tr>
                      <TD as="th" narrow nowrap>
                        File Name
                      </TD>
                      <TD as="th" nowrap narrow>
                        CVR Count
                      </TD>
                      <TD as="th" nowrap>
                        Precinct(s)
                      </TD>
                    </tr>
                    {castVoteRecordFileList.map(
                      ({ name, count, precinctIds }) => (
                        <tr key={name}>
                          <TD narrow nowrap>
                            {name}
                          </TD>
                          <TD narrow>{count}</TD>
                          <TD>{getPrecinctNames(precinctIds)}</TD>
                        </tr>
                      )
                    )}
                    <tr>
                      <TD as="th" narrow nowrap>
                        Total CVRs Count
                      </TD>
                      <TD as="th" narrow>
                        {castVoteRecordFileList.reduce(
                          (prev, curr) => prev + curr.count,
                          0
                        )}
                      </TD>
                      <TD as="th" />
                    </tr>
                  </React.Fragment>
                ) : (
                  <tr>
                    <TD colSpan={2}>
                      <em>No CVR files loaded.</em>
                    </TD>
                  </tr>
                )}
              </tbody>
            </Table>
            {castVoteRecordFiles.duplicateFiles.length > 0 && (
              <Text warning>
                {castVoteRecordFiles.duplicateFiles.length === 1 && (
                  <React.Fragment>
                    The file{' '}
                    <strong>
                      {castVoteRecordFiles.duplicateFiles.join(', ')}
                    </strong>{' '}
                    was ignored as a duplicate of a file already loaded.
                  </React.Fragment>
                )}
                {castVoteRecordFiles.duplicateFiles.length > 1 && (
                  <React.Fragment>
                    The files{' '}
                    <strong>
                      {castVoteRecordFiles.duplicateFiles.join(', ')}
                    </strong>{' '}
                    were ignored as duplicates of files already loaded.
                  </React.Fragment>
                )}
              </Text>
            )}
            {castVoteRecordFiles.errorFile && (
              <Text error>
                There was an error reading the content of the file{' '}
                <strong>{castVoteRecordFiles.errorFile}</strong>. Please ensure
                this file only contains CVR data.
              </Text>
            )}
            <p>
              <FileInputButton
                id="load-cvrs"
                multiple
                onChange={processCastVoteRecordFiles}
              >
                Load CVR Files
              </FileInputButton>{' '}
              <Button
                danger
                disabled={!hasCastVoteRecordFiles}
                onClick={resetCastVoteRecordFiles}
              >
                Remove All CVR Files
              </Button>
            </p>
            <h2>Ballot Count By Precinct</h2>
            <Table>
              <tbody>
                {hasCastVoteRecordFiles ? (
                  <React.Fragment>
                    <tr>
                      <TD as="th" narrow>
                        Precinct
                      </TD>
                      <TD as="th">Ballot Count</TD>
                      <TD as="th">View Tally</TD>
                    </tr>
                    {election.precincts
                      .sort((a, b) =>
                        a.name.localeCompare(b.name, undefined, {
                          ignorePunctuation: true,
                        })
                      )
                      .map(precinct => {
                        const precinctBallotsCount =
                          votesByPrecinct && votesByPrecinct[precinct.id]
                            ? votesByPrecinct[precinct.id]!.length
                            : 0
                        const showPrecinctTally = () => {
                          setPrecinctTally(precinct.id)
                        }
                        return (
                          <tr key={precinct.id}>
                            <TD narrow nowrap>
                              {precinct.name}
                            </TD>
                            <TD>{precinctBallotsCount}</TD>
                            <TD>
                              {!!precinctBallotsCount && (
                                <Button small onClick={showPrecinctTally}>
                                  View {precinct.name} Tally
                                </Button>
                              )}
                            </TD>
                          </tr>
                        )
                      })}
                    <tr>
                      <TD narrow>
                        <strong>Total Ballot Count</strong>
                      </TD>
                      <TD>
                        <strong>
                          {Object.values(votesByPrecinct).reduce(
                            (prev, curr) => prev + (curr ? curr.length : 0),
                            0
                          )}
                        </strong>
                      </TD>
                      <TD>
                        <Button
                          disabled={
                            !hasCastVoteRecordFiles || !fullElectionTally
                          }
                          onClick={showCastVoteRecordsTally}
                        >
                          View Full Election Tally
                        </Button>
                      </TD>
                    </tr>
                  </React.Fragment>
                ) : (
                  <tr>
                    <TD colSpan={2}>
                      <em>Load CVR files to view ballot count by precinct.</em>
                    </TD>
                  </tr>
                )}
              </tbody>
            </Table>
            <p>
              <Button
                disabled={!hasCastVoteRecordFiles}
                onClick={exportResults}
              >
                Export SEMS Results File
              </Button>
            </p>
            <HorizontalRule />
            <h1>Post-Election Actions</h1>
            <Button onClick={unconfigure}>Clear all election data</Button>
          </Prose>
        </MainChild>
      </Main>
      <MainNav title={election.title}>
        <Button small onClick={ejectUSB}>
          Eject USB
        </Button>
      </MainNav>
    </Screen>
  )
}

export default DashboardScreen

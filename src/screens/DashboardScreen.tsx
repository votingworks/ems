import React from 'react'

import {
  ButtonEventFunction,
  Election,
  SetCastVoteRecordFilesFunction,
  VotesByPrecinct,
  InputEventFunction,
} from '../config/types'

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
  programCard: ButtonEventFunction
  setCastVoteRecordFiles: SetCastVoteRecordFilesFunction
  setScreen: ButtonEventFunction
  unconfigure: () => void
  votesByPrecinct: VotesByPrecinct
  exportResults: () => void
}

const DashboardScreen = ({
  castVoteRecordFiles,
  election,
  programCard,
  setCastVoteRecordFiles,
  setScreen,
  unconfigure,
  votesByPrecinct,
  exportResults,
}: Props) => {
  const processCastVoteRecordFiles: InputEventFunction = async event => {
    const input = event.currentTarget
    const files = Array.from(input.files || [])
    const newCastVoteRecordFiles = await castVoteRecordFiles.addAll(files)
    setCastVoteRecordFiles(newCastVoteRecordFiles)
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
              <Button onClick={setScreen} data-screen="ballotproofing">
                Proof Ballot Styles
              </Button>{' '}
              <Button onClick={setScreen} data-screen="testdeck">
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
                        return (
                          <tr key={precinct.id}>
                            <TD narrow nowrap>
                              {precinct.name}
                            </TD>
                            <TD>{precinctBallotsCount}</TD>
                          </tr>
                        )
                      })}
                    <tr>
                      <TD as="th" narrow>
                        Total Ballots Count
                      </TD>
                      <TD as="th">
                        {Object.values(votesByPrecinct).reduce(
                          (prev, curr) => prev + (curr ? curr.length : 0),
                          0
                        )}
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
                onClick={setScreen}
                data-screen="tally"
              >
                View Full Election Tally
              </Button>{' '}
              <Button
                disabled={!hasCastVoteRecordFiles}
                onClick={setScreen}
                data-screen="district-tally"
              >
                View Tally By District
              </Button>{' '}
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

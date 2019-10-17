import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import fileDownload from 'js-file-download'

import { Election, InputEvent } from '../config/types'
import ConversionClient, { VxFile } from '../lib/ConversionClient'

const electionDefinitionsName = 'Vx Election Definition'

const FileField = styled.label`
  display: block;
  margin-bottom: 1rem;
  & > strong {
    display: block;
  }
  & > input {
    width: 100%;
  }
`

const Loaded = styled.p`
  min-height: 1.3333333rem;
  color: rgb(0, 128, 0);
  &::before {
    content: '✓ ';
  }
`

interface InputFile {
  name: string
  file: File
}

interface Props {
  election: Election
}

const ResultsProcessor = ({ election }: Props) => {
  const [inputFiles, setInputFiles] = useState<VxFile[]>([])
  const [hasResults, setHasResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [client] = useState(new ConversionClient('/convert', 'results'))

  const submitFile = async ({ file, name }: InputFile) => {
    try {
      await client.setInputFile(name, file)
      updateStatus() // eslint-disable-line @typescript-eslint/no-use-before-define
    } catch (error) {
      console.log('failed handleFileInput()', error) // eslint-disable-line no-console
    }
  }

  const handleFileInput = (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    const name = input.name
    if (file && name) {
      submitFile({ file, name })
    }
  }

  const submitElectionDefinitionFile = (name: string) => {
    submitFile({
      name,
      file: new File([JSON.stringify(election)], 'election.json', {
        type: 'application/json',
      }),
    })
  }

  const resetServerFiles = async () => {
    try {
      await client.reset()
      setHasResults(false)
    } catch (error) {
      console.log('failed resetServerFiles()', error) // eslint-disable-line no-console
    }
  }

  const getOutputFile = async (resultsFileName: string) => {
    try {
      const data = await client.getOutputFile(resultsFileName)
      fileDownload(data, 'sems-results.csv', 'text/csv')
      resetServerFiles()
    } catch (error) {
      console.log('failed getOutputFile()', error) // eslint-disable-line no-console
    }
  }

  const processInputFiles = async (resultsFileName: string) => {
    try {
      await client.process()
      getOutputFile(resultsFileName)
      setIsLoading(false)
      setHasResults(true)
    } catch (error) {
      console.log('failed processInputFiles()', error) // eslint-disable-line no-console
    }
  }

  const updateStatus = async () => {
    try {
      const files = await client.getFiles()
      setIsLoading(true)

      const electionDefinitionsFile = files.inputFiles[0]
      if (!electionDefinitionsFile.path) {
        submitElectionDefinitionFile(electionDefinitionsFile.name)
      }

      const resultsFile = files.outputFiles[0]
      if (resultsFile.path) {
        getOutputFile(resultsFile.name)
        return
      }

      const allInputFilesExist = files.inputFiles.every(f => !!f.path)
      if (allInputFilesExist) {
        processInputFiles(resultsFile.name)
        return
      }

      setInputFiles(
        files.inputFiles.filter(f => f.name !== electionDefinitionsName)
      )
      setIsLoading(false)
    } catch (error) {
      console.log('failed updateStatus()', error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    updateStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <React.Fragment>
      <h2>Create SEMS export file</h2>
      {isLoading && <span>Loading…</span>}
      {hasResults && <span>Downloading results file…</span>}
      {!isLoading && !hasResults && (
        <React.Fragment>
          <p>Load the following VxScan files from a USB drive:</p>
          {inputFiles.map((file: VxFile, i: number) => (
            <div key={file.name}>
              <FileField htmlFor={`f${i}`}>
                <h3>{file.name}</h3>
                {file.path ? (
                  <Loaded>Loaded</Loaded>
                ) : (
                  <p>
                    <input
                      type="file"
                      id={`f${i}`}
                      name={file.name}
                      onChange={handleFileInput}
                    />
                  </p>
                )}
              </FileField>
            </div>
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
export default ResultsProcessor

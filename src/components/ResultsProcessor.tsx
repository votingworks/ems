import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import fileDownload from 'js-file-download'

import { Election, InputEvent } from '../config/types'

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

interface VxFile {
  name: string
  path: string
}

interface VxFiles {
  inputFiles: VxFile[]
  outputFiles: VxFile[]
}

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

  const submitFile = ({ file, name }: InputFile) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    fetch('/convert/results/submitfile', {
      method: 'post',
      body: formData,
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'ok') {
          updateStatus() // eslint-disable-line @typescript-eslint/no-use-before-define
        }
      })
      .catch(error => {
        console.log('failed handleFileInput()', error) // eslint-disable-line no-console
      })
  }

  const handleFileInput = (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    const name = input.name
    if (file && name) {
      submitFile({ file, name })
    }
  }

  const submitElectionDefinitionFile = () => {
    submitFile({
      name: 'Vx Election Definition',
      file: new File([JSON.stringify(election)], 'election.json', {
        type: 'application/json',
      }),
    })
  }

  const resetServerFiles = () => {
    fetch('/convert/reset', { method: 'post' })
      .then(r => r.json())
      .then(response => {
        if (response.status === 'ok') {
          setHasResults(false)
        }
      })
      .catch(error => {
        console.log('failed resetServerFiles()', error) // eslint-disable-line no-console
      })
  }

  const getOutputFile = (resultsFileName: string) => {
    const encodedName = encodeURIComponent(resultsFileName)
    fetch(`/convert/results/output?name=${encodedName}`)
      .then(response => response.blob())
      .then(data => {
        fileDownload(data, 'sems-results.csv', 'text/csv')
        resetServerFiles()
      })
      .catch(error => {
        console.log('failed getOutputFile()', error) // eslint-disable-line no-console
      })
  }

  const processInputFiles = (resultsFileName: string) => {
    fetch('/convert/results/process', { method: 'post' })
      .then(r => r.json())
      .then(response => {
        if (response.status === 'ok') {
          getOutputFile(resultsFileName)
          setIsLoading(false)
          setHasResults(true)
        }
      })
      .catch(error => {
        console.log('failed processInputFiles()', error) // eslint-disable-line no-console
      })
  }

  const updateStatus = () => {
    fetch('/convert/results/files')
      .then(r => r.json())
      .then((files: VxFiles) => {
        setIsLoading(true)

        const electionDefinitionsFile = files.inputFiles[0]
        if (!electionDefinitionsFile.path) {
          submitElectionDefinitionFile()
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
      })
      .catch(error => {
        console.log('failed updateStatus()', error) // eslint-disable-line no-console
      })
  }

  useEffect(updateStatus, [])

  return (
    <React.Fragment>
      <h2>Process Scanner CVRs</h2>
      {isLoading && <span>Loading…</span>}
      {hasResults && <span>Downloading results file…</span>}
      {!isLoading && !hasResults && (
        <React.Fragment>
          <p>Load the following file from a USB drive, etc.</p>
          <ul>
            {inputFiles.map((file: VxFile, i: number) => (
              <li key={file.name}>
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
              </li>
            ))}
          </ul>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
export default ResultsProcessor

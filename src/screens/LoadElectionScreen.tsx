import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { InputEvent, SetElection } from '../config/types'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import readFileAsync from '../lib/readFileAsync'

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

const Invalid = styled.p`
  min-height: 1.3333333rem;
  color: rgb(128, 0, 0);
  &::before {
    content: '✘ ';
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
  setElection: SetElection
}

const allFilesExist = (files: VxFile[]) => files.every(f => !!f.path)
const anyFilesExist = (files: VxFile[]) => files.find(f => !!f.path)

const LoadElectionScreen = ({ setElection }: Props) => {
  const [inputFiles, setInputFiles] = useState<VxFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [vxElectionFileIsInvalid, setVxElectionFileIsInvalid] = useState(false)

  const resetServerFiles = () => {
    fetch('/convert/reset', { method: 'post' }).catch(error => {
      console.log('failed resetServerFiles()', error) // eslint-disable-line no-console
    })
  }

  const getOutputFile = (electionFileName: string) => {
    const encodedName = encodeURIComponent(electionFileName)
    fetch(`/convert/election/output?name=${encodedName}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(election => {
        resetServerFiles()
        setElection(election)
      })
      .catch(error => {
        console.log('failed getOutputFile()', error) // eslint-disable-line no-console
      })
  }

  const processInputFiles = (electionFileName: string) => {
    fetch('/convert/election/process', { method: 'post' })
      .then(r => r.json())
      .then(response => {
        if (response.status === 'ok') {
          getOutputFile(electionFileName)
        }
      })
      .catch(error => {
        console.log('failed processInputFiles()', error) // eslint-disable-line no-console
      })
  }

  const updateStatus = () => {
    fetch('/convert/election/files', { cache: 'no-store' })
      .then(r => r.json())
      .then((files: VxFiles) => {
        setIsLoading(true)

        const electionFile = files.outputFiles[0]
        if (electionFile.path) {
          getOutputFile(electionFile.name)
          return
        }

        if (allFilesExist(files.inputFiles)) {
          processInputFiles(electionFile.name)
          return
        }

        setInputFiles(files.inputFiles)
        setIsLoading(false)
      })
      .catch(error => {
        console.log('failed updateStatus()', error) // eslint-disable-line no-console
      })
  }

  const submitFile = ({ file, name }: InputFile) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    fetch('/convert/election/submitfile', {
      method: 'post',
      body: formData,
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'ok') {
          updateStatus()
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

  const handleVxElectionFile = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]

    if (file) {
      const fileContent = await readFileAsync(file)
      try {
        setElection(JSON.parse(fileContent))
        setVxElectionFileIsInvalid(false)
      } catch (error) {
        setVxElectionFileIsInvalid(true)
        console.error('handleVxElectionFile failed', error) // eslint-disable-line no-console
      }
    }
  }

  const resetUploadFiles = () => {
    setInputFiles([])
    setVxElectionFileIsInvalid(false)
    resetServerFiles()
    updateStatus()
  }

  useEffect(updateStatus, [])

  return (
    <Screen>
      <Main>
        <MainChild center>
          <Prose>
            {isLoading ? (
              <h1>Loading…</h1>
            ) : (
              <React.Fragment>
                <h1>Configure VxServer</h1>
                <p>Load the following files from a USB drive, etc.</p>
                {inputFiles.map((file: VxFile, i: number) => (
                  <FileField key={file.name} htmlFor={`f${i}`}>
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
                ))}
                <p>— or —</p>
                <FileField key="vx-election" htmlFor="vx-election">
                  <h3>Vx Election Definition</h3>
                  {vxElectionFileIsInvalid && <Invalid>Invalid</Invalid>}
                  <p>
                    <input
                      type="file"
                      id="vx-election"
                      name="vx-election"
                      onChange={handleVxElectionFile}
                    />
                  </p>
                </FileField>
                <Button
                  disabled={
                    !anyFilesExist(inputFiles) && !vxElectionFileIsInvalid
                  }
                  small
                  onClick={resetUploadFiles}
                >
                  Reset Files
                </Button>
              </React.Fragment>
            )}
          </Prose>
        </MainChild>
      </Main>
    </Screen>
  )
}

export default LoadElectionScreen

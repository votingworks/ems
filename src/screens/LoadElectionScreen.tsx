import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { InputEvent, SetElection } from '../config/types'

import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'

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
  setElection: SetElection
}

const LoadElectionScreen = ({ setElection }: Props) => {
  const [inputFiles, setInputFiles] = useState<VxFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

        const allInputFilesExist = files.inputFiles.every(f => !!f.path)
        if (allInputFilesExist) {
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
              </React.Fragment>
            )}
          </Prose>
        </MainChild>
      </Main>
    </Screen>
  )
}

export default LoadElectionScreen

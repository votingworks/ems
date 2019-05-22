import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { InputEvent, SetElection } from '../config/types'

import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'

const FileField = styled.label`
  display: block;
  margin: 1.5rem 0;
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

interface File {
  name: string
  path: string
}

interface Props {
  setElection: SetElection
}

const LoadElectionConfigScreen = ({ setElection }: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getElectionConfigFile = (electionFileName: string) => {
    const encodedName = encodeURIComponent(electionFileName)
    fetch(`/convert/election/output?name=${encodedName}`)
      .then(r => r.json())
      .then(setElection)
      .catch(error => {
        console.log('failed getElectionConfigFile()', error) // eslint-disable-line no-console
      })
  }

  const createElectionConfigFile = (electionFileName: string) => {
    fetch('/convert/election/process', { method: 'post' })
      .then(r => r.json())
      .then(response => {
        if (response.status === 'ok') {
          getElectionConfigFile(electionFileName)
        }
      })
      .catch(error => {
        console.log('failed createElectionConfigFile()', error) // eslint-disable-line no-console
      })
  }

  const getElectionStatus = () => {
    fetch('/convert/election/files')
      .then(r => r.json())
      .then(files => {
        setIsLoading(true)
        const { inputFiles, outputFiles } = files

        const electionFile = outputFiles[0]
        if (electionFile.path) {
          getElectionConfigFile(electionFile.name)
          return
        }

        const allInputFilesExist = inputFiles.every((f: File) => !!f.path)
        if (allInputFilesExist) {
          createElectionConfigFile(electionFile.name)
          return
        }

        setFiles(inputFiles)
        setIsLoading(false)
      })
      .catch(error => {
        console.log('failed getElectionStatus()', error) // eslint-disable-line no-console
      })
  }

  const handleFileInput = (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    const name = input.name
    if (file) {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('file', file)
      fetch('/convert/election/submitfile', {
        method: 'post',
        body: formData,
      })
        .then(res => res.json())
        .then(response => {
          if (response.status === 'ok') {
            getElectionStatus()
          }
        })
        .catch(error => {
          console.log('failed handleFileInput()', error) // eslint-disable-line no-console
        })
    }
  }

  useEffect(getElectionStatus, [])

  return (
    <Screen>
      <Main>
        <MainChild center>
          <Prose>
            {isLoading ? (
              <h1>Loading…</h1>
            ) : (
              <React.Fragment>
                <h1>Load SEMS Files</h1>
                {files.map((file: File, i: number) => (
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

export default LoadElectionConfigScreen

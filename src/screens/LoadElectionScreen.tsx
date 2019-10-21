import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { InputEvent, SetElection } from '../config/types'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import readFileAsync from '../lib/readFileAsync'
import ConverterClient, { VxFile } from '../lib/ConverterClient'

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

interface InputFile {
  name: string
  file: File
}

interface Props {
  setElection: SetElection
}

const allFilesExist = (files: VxFile[]) => files.every(f => !!f.path)
const someFilesExist = (files: VxFile[]) => files.some(f => !!f.path)

const LoadElectionScreen = ({ setElection }: Props) => {
  const [inputFiles, setInputFiles] = useState<VxFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [vxElectionFileIsInvalid, setVxElectionFileIsInvalid] = useState(false)
  const [client] = useState(new ConverterClient('election'))

  const resetServerFiles = async () => {
    try {
      await client.reset()
    } catch (error) {
      console.log('failed resetServerFiles()', error) // eslint-disable-line no-console
    }
  }

  const getOutputFile = async (electionFileName: string) => {
    try {
      const blob = await client.getOutputFile(electionFileName)
      await resetServerFiles()
      setElection(await new Response(blob).json())
    } catch (error) {
      console.log('failed getOutputFile()', error) // eslint-disable-line no-console
    }
  }

  const processInputFiles = async (electionFileName: string) => {
    try {
      await client.process()
      await getOutputFile(electionFileName)
    } catch (error) {
      console.log('failed processInputFiles()', error) // eslint-disable-line no-console
    }
  }

  const updateStatus = async () => {
    try {
      const files = await client.getFiles()

      setIsLoading(true)

      const electionFile = files.outputFiles[0]
      if (electionFile.path) {
        await getOutputFile(electionFile.name)
        return
      }

      if (allFilesExist(files.inputFiles)) {
        await processInputFiles(electionFile.name)
        return
      }

      setInputFiles(files.inputFiles)
      setIsLoading(false)
    } catch (error) {
      console.log('failed updateStatus()', error) // eslint-disable-line no-console
    }
  }

  const submitFile = async ({ file, name }: InputFile) => {
    try {
      await client.setInputFile(name, file)
      await updateStatus()
    } catch (error) {
      console.log('failed handleFileInput()', error) // eslint-disable-line no-console
    }
  }

  const handleFileInput = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    const name = input.name
    if (file && name) {
      await submitFile({ file, name })
    }
  }

  const handleVxElectionFile = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]

    if (file) {
      setVxElectionFileIsInvalid(false)
      try {
        const fileContent = await readFileAsync(file)
        setElection(JSON.parse(fileContent))
      } catch (error) {
        setVxElectionFileIsInvalid(true)
        console.error('handleVxElectionFile failed', error) // eslint-disable-line no-console
      }
    }
  }

  const resetUploadFiles = async () => {
    setInputFiles([])
    setVxElectionFileIsInvalid(false)
    await resetServerFiles()
    await updateStatus()
  }

  useEffect(() => {
    updateStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                    !someFilesExist(inputFiles) && !vxElectionFileIsInvalid
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

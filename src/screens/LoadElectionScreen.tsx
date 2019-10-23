import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SetElection, InputEventFunction } from '../config/types'

import ConverterClient, { VxFile } from '../lib/ConverterClient'
import readFileAsync from '../lib/readFileAsync'

import Button from '../components/Button'
import FileInputButton from '../components/FileInputButton'
import HorizontalRule from '../components/HorizontalRule'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Screen from '../components/Screen'

const Loaded = styled.p`
  line-height: 2.5rem;
  color: rgb(0, 128, 0);
  &::before {
    content: '✓ ';
  }
`
const Invalid = styled.p`
  line-height: 2.5rem;
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

  const handleFileInput: InputEventFunction = async event => {
    const input = event.currentTarget
    const file = input.files && input.files[0]
    const name = input.name
    if (file && name) {
      await submitFile({ file, name })
    }
  }

  const handleVxElectionFile: InputEventFunction = async event => {
    const input = event.currentTarget
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
          <Prose textCenter>
            {isLoading ? (
              <h1>Loading…</h1>
            ) : (
              <React.Fragment>
                <h1>Configure VxServer</h1>
                <p>Select the following files from a USB drive, etc.</p>
                <HorizontalRule />
                {inputFiles.map((file: VxFile, i: number) =>
                  file.path ? (
                    <Loaded key={file.name}>{`Loaded ${file.name}`}</Loaded>
                  ) : (
                    <p key={file.name}>
                      <FileInputButton
                        buttonProps={{
                          fullWidth: true,
                        }}
                        id={`f${i}`}
                        name={file.name}
                        onChange={handleFileInput}
                      >
                        {file.name}
                      </FileInputButton>
                    </p>
                  )
                )}
                <HorizontalRule>or</HorizontalRule>
                {vxElectionFileIsInvalid && (
                  <Invalid>Invalid Vx Election Definition file.</Invalid>
                )}
                <p>
                  <FileInputButton
                    buttonProps={{
                      fullWidth: true,
                    }}
                    id="vx-election"
                    name="vx-election"
                    onChange={handleVxElectionFile}
                  >
                    Vx Election Definition file
                  </FileInputButton>
                </p>
                <HorizontalRule />
                <p>
                  <Button
                    disabled={
                      !someFilesExist(inputFiles) && !vxElectionFileIsInvalid
                    }
                    small
                    onClick={resetUploadFiles}
                  >
                    Reset Files
                  </Button>
                </p>
              </React.Fragment>
            )}
          </Prose>
        </MainChild>
      </Main>
    </Screen>
  )
}

export default LoadElectionScreen

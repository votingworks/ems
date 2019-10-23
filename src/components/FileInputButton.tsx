import React from 'react'
import styled from 'styled-components'

import { InputEventFunction } from '../config/types'

import { LabelButton, buttonFocusStyle } from './Button'

interface Props {
  accept?: string
  children: React.ReactNode
  id: string
  multiple?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  z-index: -1;
  width: 0.1px;
  height: 0.1px;
  overflow: hidden;
  &:focus + label {
    ${buttonFocusStyle}
  }
  &:hover + label,
  &:active + label {
    outline: none;
  }
`

const FileInputButton = ({
  accept,
  children,
  id,
  multiple,
  onChange,
}: Props) => {
  const onBlur: InputEventFunction = event => {
    const input = event.currentTarget
    input!.blur()
  }
  return (
    <React.Fragment>
      <HiddenFileInput
        accept={accept}
        id={id}
        multiple={multiple}
        onChange={onChange}
        onBlur={onBlur}
        type="file"
      />
      <LabelButton htmlFor={id}>{children}</LabelButton>
    </React.Fragment>
  )
}

export default FileInputButton

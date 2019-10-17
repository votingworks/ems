import React from 'react'
import styled, { css } from 'styled-components'

import { buttonStyles } from './Button'

interface Props {
  accept?: string
  children: React.ReactNode
  multiple?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const hiddenFileInputStyles = css`
  position: absolute;
  opacity: 0;
  z-index: -1;
  width: 0.1px;
  height: 0.1px;
  overflow: hidden;
`

const LabelButton = styled.label`
  ${buttonStyles} /* stylelint-disable-line value-keyword-case */
  & > input {
    ${hiddenFileInputStyles} /* stylelint-disable-line value-keyword-case */
  }
`

const FileInputButton = ({ accept, children, multiple, onChange }: Props) => (
  <LabelButton>
    {children}
    <input
      accept={accept}
      multiple={multiple}
      onChange={onChange}
      type="file"
    />
  </LabelButton>
)

export default FileInputButton
